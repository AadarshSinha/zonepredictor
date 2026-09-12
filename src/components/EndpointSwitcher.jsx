import { useState } from "react";

import { DEFAULT_API_URL, getApiBaseUrl, setApiBaseUrl, IS_DEV } from "../config";

/**
 * Development-only control for pointing the app at a different backend without
 * restarting the dev server — handy for testing the production API from localhost,
 * or a LAN IP from a phone.
 *
 * Reloads after switching: the new URL is picked up by every subsequent request,
 * but a reload also resets the health poll and clears any stale results.
 */
export function EndpointSwitcher() {
  const [value, setValue] = useState(getApiBaseUrl());

  if (!IS_DEV) return null;

  const apply = (url) => {
    setApiBaseUrl(url);
    window.location.reload();
  };

  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Dev only · API endpoint
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(value.trim());
        }}
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <label htmlFor="api-endpoint" className="sr-only">
          API base URL
        </label>
        <input
          id="api-endpoint"
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={DEFAULT_API_URL}
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 focus:border-green-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-green-400"
        >
          Use
        </button>
        <button
          type="button"
          onClick={() => apply(null)}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:text-white"
        >
          Reset
        </button>
      </form>

      <p className="mt-2 text-xs text-zinc-600">
        Default for this build: <code>{DEFAULT_API_URL}</code>
      </p>
    </div>
  );
}
