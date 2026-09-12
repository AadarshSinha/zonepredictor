/**
 * Where the API lives.
 *
 * Resolution order:
 *   1. `zp_api_url` in localStorage  — runtime override, survives reloads.
 *      Set it from the devtools console, or use the switcher in the footer
 *      that appears on localhost:  localStorage.setItem('zp_api_url', '...')
 *   2. VITE_API_URL from the .env file for the current mode
 *        npm run dev        -> .env.development -> http://localhost:4000
 *        npm run dev:prod   -> .env.production  -> https://api.zonepredictor.com
 *        npm run build      -> .env.production
 *        npm run build:local-> .env.development
 *   3. http://localhost:4000
 *
 * Anything in `.env.local` overrides the mode file and is gitignored, so you
 * can point at a LAN IP for phone testing without dirtying the repo.
 */
const LOCAL_STORAGE_KEY = "zp_api_url";

const readOverride = () => {
  try {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null; // private browsing / storage disabled
  }
};

const stripTrailingSlash = (url) => url.replace(/\/+$/, "");

export const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getApiBaseUrl = () =>
  stripTrailingSlash(readOverride() || DEFAULT_API_URL);

export const setApiBaseUrl = (url) => {
  try {
    if (url) window.localStorage.setItem(LOCAL_STORAGE_KEY, stripTrailingSlash(url));
    else window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore — the override is a convenience, not a requirement
  }
};

/** Show the endpoint switcher only while developing. */
export const IS_DEV = import.meta.env.DEV;
