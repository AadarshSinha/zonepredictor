import { useCallback, useEffect, useState } from "react";

import { sendProductFeedback } from "../api/client";

// Early enough to catch people who bounce quickly.
const DELAY_MS = 10000;

/** Matches Feedback.GAMES on the backend. */
const GAMES = [
  { value: "pubg_pc", label: "PUBG PC" },
  { value: "pubg_mobile", label: "PUBG Mobile" },
  { value: "bgmi", label: "BGMI" },
];

/**
 * One question, one answer, on every page load.
 *
 * Deliberately not remembered between visits: nothing is written to storage,
 * so a reload asks again. Dismissing hides it for the current page only.
 */
export function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Declared before the effect that uses it — a `const` referenced from an
  // earlier closure cannot be read at definition time.
  const dismiss = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const submit = async (event) => {
    event.preventDefault();
    const text = message.trim();
    // A tap on its own is a complete answer — text is the optional half.
    if ((!text && !game) || sending) return;

    setSending(true);
    try {
      await sendProductFeedback({ game, message: text });
    } catch {
      // Their answer is worth more than a correct error message here; thank
      // them either way rather than turning a favour into a problem.
    }
    setSending(false);
    setSent(true);
    setTimeout(() => setOpen(false), 1600);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="feedback-prompt-title"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-zinc-700 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur sm:left-auto sm:right-6"
    >
      {sent ? (
        <p className="text-sm text-green-400">Thanks — that genuinely helps.</p>
      ) : (
        <form onSubmit={submit}>
          <div className="flex items-start justify-between gap-3">
            <h2 id="feedback-prompt-title" className="text-sm font-semibold">
              Which do you play?
            </h2>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="-mt-1 shrink-0 text-zinc-500 transition hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {GAMES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={game === option.value}
                onClick={() =>
                  setGame((current) =>
                    current === option.value ? null : option.value
                  )
                }
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  game === option.value
                    ? "border-green-400 bg-green-500/15 text-white"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label htmlFor="feedback-message" className="mt-4 block text-xs text-zinc-500">
            Anything you wish it did better? (optional)
          </label>
          <textarea
            id="feedback-message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            className="mt-2 w-full resize-none rounded-lg border border-zinc-700 bg-black/60 px-3 py-2 text-sm text-white outline-none transition focus:border-green-400"
          />

          <button
            type="submit"
            disabled={(!message.trim() && !game) || sending}
            className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-black transition ${
              (!message.trim() && !game) || sending
                ? "cursor-not-allowed bg-green-500/50"
                : "bg-green-500 hover:bg-green-400"
            }`}
          >
            {sending ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
