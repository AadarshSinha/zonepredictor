import { useState } from "react";

/**
 * Shown across the top when /health cannot be reached.
 *
 * The point is to answer the question the visitor is about to ask — "is it me
 * or is it them?" — before they upload a screenshot and get a bare failure.
 */
export function OfflineBanner({ status, onRetry }) {
  const [retrying, setRetrying] = useState(false);

  if (status !== "offline") return null;

  const retry = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[3.75rem] z-30 border-y border-amber-500/30 bg-amber-500/10 px-6 py-3 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
        <span aria-hidden="true">⚠️</span>
        <span className="text-amber-200">
          The prediction server is not responding right now. Everything else on
          this page still works — predictions will resume automatically once it
          is back.
        </span>
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="font-medium text-amber-100 underline underline-offset-4 transition hover:text-white disabled:opacity-60"
        >
          {retrying ? "Checking…" : "Check again"}
        </button>
      </div>
    </div>
  );
}
