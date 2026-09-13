import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

/* ----------------------------------------------------------------- fixtures */

// Stays under the 1MB threshold so prepareImageForUpload short-circuits and we
// never touch canvas, which jsdom does not implement.
const screenshot = () =>
  new File(["fake-image-bytes"], "zone.jpg", { type: "image/jpeg" });

const noHeaders = { get: () => null };

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: noHeaders,
  json: async () => body,
  blob: async () => new Blob([JSON.stringify(body)], { type: "application/json" }),
});

// The real /predict returns a JPEG body plus the logged row's id in a header,
// which is what the feedback buttons post back against.
const imageResponse = (predictionId = "42") => ({
  ok: true,
  status: 200,
  headers: {
    get: (name) =>
      name.toLowerCase() === "x-prediction-id" ? predictionId : null,
  },
  json: async () => {
    throw new SyntaxError("not json");
  },
  blob: async () => new Blob(["jpeg"], { type: "image/jpeg" }),
});

const HEALTH_OK = {
  status: "ok",
  version: "1.1.0",
  modelsLoaded: true,
  supportedMaps: ["Erangel", "Miramar"],
  billingEnabled: false,
};

/**
 * Routes by path, because the app now makes several different calls (health on
 * mount, /auth/me when a token exists, /predict on demand) and a single blanket
 * mock would answer all of them with the same body.
 *
 * Each handler is either a response object or a function; throwing simulates a
 * dead server.
 */
const mockBackend = (routes = {}) => {
  const handlers = { "/health": () => jsonResponse(200, HEALTH_OK), ...routes };

  const fetchMock = vi.fn(async (url, init) => {
    const path = Object.keys(handlers).find((key) => String(url).endsWith(key));
    if (!path) throw new TypeError(`Unhandled request: ${url}`);
    const handler = handlers[path];
    return typeof handler === "function" ? handler(init) : handler;
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const callsTo = (fetchMock, path) =>
  fetchMock.mock.calls.filter(([url]) => String(url).endsWith(path));

const pickFile = async (container, user) =>
  user.upload(container.querySelector('input[type="file"]'), screenshot());

const predict = async (user) =>
  user.click(screen.getByRole("button", { name: /predict next zone/i }));

/* ------------------------------------------------------------------- setup */

let createdUrls;
let revokedUrls;

beforeEach(() => {
  window.localStorage.clear();
  createdUrls = [];
  revokedUrls = [];
  let n = 0;
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => {
      const url = `blob:mock/${n++}`;
      createdUrls.push(url);
      return url;
    }),
    revokeObjectURL: vi.fn((url) => revokedUrls.push(url)),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------- prediction */

describe("prediction upload", () => {
  it("shows the backend's explanation when it refuses the image (422)", async () => {
    mockBackend({
      "/predict": () =>
        jsonResponse(422, {
          code: "ZONE_NOT_DETECTED",
          error: "No zone circle was found in that screenshot.",
        }),
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No zone circle was found in that screenshot."
    );
    // The broken-image bug: a failed response must not become an <img>.
    expect(screen.queryByAltText("Prediction result")).toBeNull();
  });

  it("adds actionable guidance for a retired map", async () => {
    mockBackend({
      "/predict": () =>
        jsonResponse(422, {
          code: "MAP_NOT_SUPPORTED",
          error: "Vikendi is not supported.",
        }),
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Vikendi is not supported.");
    expect(alert).toHaveTextContent(/Erangel and Miramar only/i);
  });

  it("falls back to a generic message when the server returns a non-JSON 500", async () => {
    mockBackend({
      "/predict": () => ({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      }),
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again."
    );
    expect(screen.queryByAltText("Prediction result")).toBeNull();
  });

  it("explains a network failure rather than failing silently", async () => {
    mockBackend({
      "/predict": () => {
        throw new TypeError("Failed to fetch");
      },
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not reach the prediction server/i
    );
  });

  it("renders the returned image on success", async () => {
    mockBackend({ "/predict": imageResponse });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    expect(await screen.findByAltText("Prediction result")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("posts the file to the configured backend", async () => {
    const fetchMock = mockBackend({ "/predict": imageResponse });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    await waitFor(() => expect(callsTo(fetchMock, "/predict")).toHaveLength(1));
    const [url, opts] = callsTo(fetchMock, "/predict")[0];
    expect(url).toBe("http://localhost:4000/predict");
    expect(opts.method).toBe("POST");
    expect(opts.body.get("file")).toBeInstanceOf(File);
  });

  it("revokes the previous result URL instead of leaking it", async () => {
    mockBackend({ "/predict": imageResponse });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    const first = (await screen.findByAltText("Prediction result")).getAttribute(
      "src"
    );

    await predict(user);
    await waitFor(() => expect(revokedUrls).toContain(first));
    expect(createdUrls).toContain(first);
  });

  it("clears a previous error when a new file is chosen", async () => {
    mockBackend({
      "/predict": () =>
        jsonResponse(422, { code: "ZONE_NOT_DETECTED", error: "No zone circle." }),
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await pickFile(container, user);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("keeps the predict button disabled until a file is chosen", async () => {
    mockBackend();
    render(<App />);
    expect(screen.getByRole("button", { name: /predict next zone/i })).toBeDisabled();
  });
});

/* ---------------------------------------------------------------- offline */

describe("backend availability", () => {
  it("warns the visitor when the health check cannot reach the server", async () => {
    mockBackend({
      "/health": () => {
        throw new TypeError("Failed to fetch");
      },
    });

    render(<App />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      /prediction server is not responding/i
    );
  });

  it("says nothing while the server is healthy", async () => {
    const fetchMock = mockBackend();
    render(<App />);

    await waitFor(() => expect(callsTo(fetchMock, "/health")).toHaveLength(1));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("recovers without a reload once the server answers again", async () => {
    let up = false;
    mockBackend({
      "/health": () => {
        if (!up) throw new TypeError("Failed to fetch");
        return jsonResponse(200, HEALTH_OK);
      },
    });

    const user = userEvent.setup();
    render(<App />);

    const banner = await screen.findByRole("status");
    up = true;
    await user.click(within(banner).getByRole("button", { name: /check again/i }));

    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
});

/* ------------------------------------------------------------------- auth */

describe("accounts", () => {
  const openDialog = async (user) => {
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));
    return screen.findByRole("dialog");
  };

  it("signs in and remembers the session", async () => {
    const fetchMock = mockBackend({
      "/auth/login": () =>
        jsonResponse(200, {
          token: "jwt-123",
          user: { id: 1, email: "player@example.com", plan: "free" },
        }),
    });

    const user = userEvent.setup();
    render(<App />);

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText(/email/i), "player@example.com");
    await user.type(within(dialog).getByLabelText(/password/i), "hunter2hunter2");
    await user.click(within(dialog).getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByText("player@example.com")).toBeInTheDocument();
    expect(window.localStorage.getItem("zp_token")).toBe("jwt-123");

    const [, opts] = callsTo(fetchMock, "/auth/login")[0];
    expect(JSON.parse(opts.body)).toEqual({
      email: "player@example.com",
      password: "hunter2hunter2",
      name: undefined,
    });
  });

  it("shows the server's wording when credentials are wrong", async () => {
    mockBackend({
      "/auth/login": () =>
        jsonResponse(401, {
          code: "INVALID_CREDENTIALS",
          error: "Incorrect email or password.",
        }),
    });

    const user = userEvent.setup();
    render(<App />);

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText(/email/i), "player@example.com");
    await user.type(within(dialog).getByLabelText(/password/i), "wrongpassword");
    await user.click(within(dialog).getByRole("button", { name: /^sign in$/i }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Incorrect email or password."
    );
    expect(window.localStorage.getItem("zp_token")).toBeNull();
  });

  it("sends the token on predictions once signed in", async () => {
    window.localStorage.setItem("zp_token", "jwt-123");
    const fetchMock = mockBackend({
      "/auth/me": () =>
        jsonResponse(200, { user: { id: 1, email: "p@example.com", plan: "free" } }),
      "/predict": imageResponse,
    });

    const user = userEvent.setup();
    const { container } = render(<App />);
    await pickFile(container, user);
    await predict(user);

    await waitFor(() => expect(callsTo(fetchMock, "/predict")).toHaveLength(1));
    const [, opts] = callsTo(fetchMock, "/predict")[0];
    expect(opts.headers.Authorization).toBe("Bearer jwt-123");
  });

  it("does not sign the user out just because the backend is unreachable", async () => {
    window.localStorage.setItem("zp_token", "jwt-123");
    mockBackend({
      "/auth/me": () => {
        throw new TypeError("Failed to fetch");
      },
      "/health": () => {
        throw new TypeError("Failed to fetch");
      },
    });

    render(<App />);

    await screen.findByRole("status");
    expect(window.localStorage.getItem("zp_token")).toBe("jwt-123");
  });

  it("discards a token the server rejects", async () => {
    window.localStorage.setItem("zp_token", "expired");
    mockBackend({
      "/auth/me": () =>
        jsonResponse(401, { code: "INVALID_SIGNATURE", error: "Bad token." }),
    });

    render(<App />);

    await waitFor(() =>
      expect(window.localStorage.getItem("zp_token")).toBeNull()
    );
  });
});

describe("prediction feedback", () => {
  const uploadAndPredict = async (user) => {
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, screenshot());
    await user.click(screen.getByRole("button", { name: /predict next zone/i }));
    await screen.findByAltText(/prediction result/i);
  };

  it("asks how good the prediction was once a result is shown", async () => {
    mockBackend({ "/predict": () => imageResponse("42") });
    const user = userEvent.setup();
    render(<App />);

    await uploadAndPredict(user);

    expect(screen.getByText(/how close was this/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /spot on/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /way off/i })).toBeInTheDocument();
  });

  it("posts the rating against the prediction it belongs to", async () => {
    const fetchMock = mockBackend({
      "/predict": () => imageResponse("42"),
      "/predict/42/feedback": () => jsonResponse(200, { ok: true, rating: "spot_on" }),
    });
    const user = userEvent.setup();
    render(<App />);

    await uploadAndPredict(user);
    await user.click(screen.getByRole("button", { name: /spot on/i }));

    const call = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith("/predict/42/feedback")
    );
    expect(call).toBeTruthy();
    expect(call[1].method).toBe("POST");
    expect(JSON.parse(call[1].body)).toEqual({ rating: "spot_on" });

    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it("still thanks the user when saving the rating fails", async () => {
    // Feedback is a nicety — a failure must not interrupt someone who already
    // has their prediction.
    mockBackend({
      "/predict": () => imageResponse("42"),
      "/predict/42/feedback": () => {
        throw new TypeError("Failed to fetch");
      },
    });
    const user = userEvent.setup();
    render(<App />);

    await uploadAndPredict(user);
    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(await screen.findByText(/thanks for trying/i)).toBeInTheDocument();
  });

  it("hides the question when the server sent no prediction id", async () => {
    mockBackend({ "/predict": () => imageResponse(null) });
    const user = userEvent.setup();
    render(<App />);

    await uploadAndPredict(user);

    expect(screen.queryByText(/how close was this/i)).not.toBeInTheDocument();
  });
});

describe("product feedback prompt", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const openPrompt = async () => {
    render(<App />);
    await act(async () => {
      vi.advanceTimersByTime(10100);
    });
  };

  it("appears on a timer and offers the three games", async () => {
    mockBackend();
    await openPrompt();

    expect(screen.getByText(/which do you play/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PUBG PC" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PUBG Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BGMI" })).toBeInTheDocument();
  });

  it("saves on the tap itself, with no Save button to press", async () => {
    const fetchMock = mockBackend({ "/feedback": () => jsonResponse(201, { ok: true }) });
    const user = userEvent.setup();
    await openPrompt();

    expect(screen.queryByRole("button", { name: /^save$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "PUBG PC" }));

    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith("/feedback"));
    expect(call).toBeTruthy();
    const body = JSON.parse(call[1].body);
    expect(body.game).toBe("pubg_pc");
    expect(body.message).toBeNull();
    expect(typeof body.timezone).toBe("string");

    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it("thanks the user even when saving fails", async () => {
    mockBackend({
      "/feedback": () => {
        throw new TypeError("Failed to fetch");
      },
    });
    const user = userEvent.setup();
    await openPrompt();

    await user.click(screen.getByRole("button", { name: "BGMI" }));
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it("asks again on the next load, remembering nothing", async () => {
    mockBackend();
    const user = userEvent.setup();
    const first = render(<App />);
    await act(async () => {
      vi.advanceTimersByTime(10100);
    });
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByText(/which do you play/i)).not.toBeInTheDocument();

    first.unmount();
    render(<App />);
    await act(async () => {
      vi.advanceTimersByTime(10100);
    });
    expect(screen.getByText(/which do you play/i)).toBeInTheDocument();
  });
});
