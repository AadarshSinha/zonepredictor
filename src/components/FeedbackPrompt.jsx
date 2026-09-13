import { useCallback, useEffect, useState } from "react";

import { sendProductFeedback } from "../api/client";

const ASKED_KEY = "zp_asked_product_feedback";

// Early enough to catch people who bounce quickly.
const DELAY_MS = 10000;

const alreadyAsked = () => {
  try {
    return window.localStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false; // storage disabled — worst case we ask again next visit
  }
};

const markAsked = () => {
  try {
    window.localStorage.setItem(ASKED_KEY, "1");
  } catch {
    // Nothing to do; the prompt is a nicety, not a feature to break over.
  }
};

/**
 * One question, one answer, once per visitor.
 *
 * Shown on a timer rather than after a prediction: most visitors never upload
 * anything, and what they were hoping for is exactly what we want to know.
 */
export function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (alreadyAsked()) return undefined;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Declared before the effect that uses it — a `const` referenced from an
  // earlier closure cannot be read at definition time.
  const dismiss = useCallback(() => {
    markAsked();
    setOpen(false);
  }, []);

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
    if (!text || sending) return;

    setSending(true);
    markAsked();
    try {
      await sendProductFeedback(text);
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
              What are you hoping ZonePredictor does for you?
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

          <p className="mt-1 text-xs text-zinc-500">
            Is this what you wanted, or do you need better accuracy?
          </p>

          <label htmlFor="feedback-message" className="sr-only">
            Your answer
          </label>
          <textarea
            id="feedback-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            autoFocus
            className="mt-3 w-full resize-none rounded-lg border border-zinc-700 bg-black/60 px-3 py-2 text-sm text-white outline-none transition focus:border-green-400"
          />

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className={`mt-3 w-full rounded-lg py-2.5 text-sm font-semibold text-black transition ${
              !message.trim() || sending
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
