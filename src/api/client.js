/**
 * The single place that talks to the backend.
 *
 * Every failure — a refused upload, a 500, a dead server — arrives here as an
 * `ApiError` carrying the machine-readable `code` the API documents, so the UI
 * can branch on the code and still have a sentence to show the user.
 *
 * The base URL is read per-request (not captured at module load) so switching
 * endpoints from the footer takes effect on the very next call.
 */
import { getApiBaseUrl } from "../config";

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const OFFLINE_MESSAGE =
  "Could not reach the prediction server. It may be starting up — please try again in a moment.";

export class ApiError extends Error {
  constructor(message, { code = "UNKNOWN", status = 0 } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  /** True when the request never reached the server (down, CORS, no network). */
  get isOffline() {
    return this.code === "NETWORK" || this.code === "TIMEOUT";
  }
}

/* ------------------------------------------------------------------ token */

const TOKEN_KEY = "zp_token";

export const readToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // private browsing / storage disabled
  }
};

export const writeToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sign-in still works for this tab; it just will not survive a reload.
  }
};

/* ---------------------------------------------------------------- request */

const toApiError = async (response) => {
  let code = `HTTP_${response.status}`;
  let message = GENERIC_MESSAGE;
  try {
    const data = await response.json();
    if (data?.code) code = data.code;
    if (data?.error) message = data.error;
  } catch {
    // A proxy error page or an empty body — keep the generic message.
  }
  return new ApiError(message, { code, status: response.status });
};

async function request(
  path,
  { method = "GET", body, auth = false, raw = false, timeoutMs = 60000 } = {}
) {
  const headers = {};
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = readToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
      signal: controller?.signal,
    });
  } catch (err) {
    // fetch only rejects when the request never completed.
    if (err?.name === "AbortError") {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        { code: "TIMEOUT" }
      );
    }
    throw new ApiError(OFFLINE_MESSAGE, { code: "NETWORK" });
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (!response.ok) throw await toApiError(response);
  if (raw) {
    // The body is a JPEG, so anything else the caller needs — the prediction's
    // row id, for attaching feedback to it — comes back in a header.
    const blob = await response.blob();
    return { blob, predictionId: response.headers.get("X-Prediction-Id") };
  }

  try {
    return await response.json();
  } catch {
    return null; // 204 and friends
  }
}

/* -------------------------------------------------------------- endpoints */

/** Cheap liveness probe. Short timeout: this drives the "offline" banner. */
export const getHealth = () => request("/health", { timeoutMs: 8000 });

export const signup = (email, password, name) =>
  request("/auth/signup", { method: "POST", body: { email, password, name } });

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

export const getMe = () => request("/auth/me", { auth: true });

export const getPlans = () => request("/billing/plans");

/**
 * Returns `{ blob, predictionId }` — the annotated screenshot, plus the id of
 * the row the backend logged it as, which `ratePrediction` needs. Signed-in
 * users are attributed in that log; anonymous predictions are still allowed.
 */
export const predictZone = (file, filename = "screenshot.jpg") => {
  const form = new FormData();
  form.append("file", file, filename);
  return request("/predict", { method: "POST", body: form, auth: true, raw: true });
};

/**
 * Answer to the "what are you looking for?" prompt. Timezone and locale come
 * from the browser itself — no permission prompt, and enough to know which
 * part of the world an answer came from.
 */
export const sendProductFeedback = (message) =>
  request("/feedback", {
    method: "POST",
    auth: true,
    body: {
      message,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      locale: navigator.language ?? null,
    },
  });

/** How good was that prediction? One of "spot_on" | "close" | "way_off". */
export const ratePrediction = (predictionId, rating) =>
  request(`/predict/${predictionId}/feedback`, {
    method: "POST",
    body: { rating },
    auth: true,
  });
