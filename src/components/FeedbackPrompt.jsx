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

  // The tap is the submission. No Save button to forget, nothing to lose by
  // closing the tab — the answer is recorded the moment it is given.
  const choose = async (value) => {
    if (sending || sent) return;

    setSending(true);
    try {
      await sendProductFeedback({ game: value });
    } catch {
      // Their answer is worth more than a correct error message here; thank
      // them either way rather than turning a favour into a problem.
    }
    setSending(false);
    setSent(true);
    setTimeout(() => setOpen(false), 1800);
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
        <p className="text-sm text-green-400">Thanks — that helps.</p>
      ) : (
        <>
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
                disabled={sending}
                onClick={() => choose(option.value)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-green-400 hover:bg-green-500/10 hover:text-white disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
