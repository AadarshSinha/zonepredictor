# ZonePredictor — web frontend

React + Vite + Tailwind single-page site for
[zonepredictor.com](https://zonepredictor.com). Deployed on Netlify.

The API it talks to lives in a separate repository (`serverbgmi/`).

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173, API at http://localhost:4000
```

## Switching between the local and production API

The API base URL is resolved in `src/config.js`, in this order:

1. `zp_api_url` in `localStorage` — a runtime override that survives reloads.
   In development a switcher appears in the footer; you can also set it by hand
   with `localStorage.setItem('zp_api_url', 'http://192.168.1.20:4000')`, which
   is the easiest way to test from a phone on the same network.
2. `VITE_API_URL` from the `.env` file for the current mode.
3. `http://localhost:4000`.

| Command | Env file | API |
| --- | --- | --- |
| `npm run dev` | `.env.development` | `http://localhost:4000` |
| `npm run dev:prod` | `.env.production` | `https://api.zonepredictor.com` |
| `npm run build` | `.env.production` | production bundle |
| `npm run build:local` | `.env.development` | production bundle against localhost |

`.env.local` overrides the mode file and is gitignored, so you can point at a
LAN IP without dirtying the repo. Copy `.env.example` to get started.

The production API must be **HTTPS** — the site is served over HTTPS, so a
plain-HTTP backend gets blocked by the browser as mixed content.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production bundle into `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (jsdom) |
| `npm run test:watch` | Vitest in watch mode |

## Tests

`src/App.test.jsx` drives the real app through jsdom with `fetch` stubbed per
route. It covers the things that are easy to break and hard to notice:

- a refused upload shows the server's message and **not** a broken `<img>`
- a non-JSON 500 falls back to a generic message
- an unreachable server is explained rather than failing silently
- object URLs are revoked instead of leaked
- the offline banner appears, and clears without a reload once the server returns
- signing in stores the token, and predictions then carry `Authorization`
- a token the server rejects is discarded, but an unreachable server does **not**
  sign the user out
- the rating buttons post against the right prediction, and a failed rating
  still thanks the user instead of interrupting them

## Structure

```
src/
  config.js            API base URL resolution (env + localStorage override)
  api/client.js        the only module that calls fetch; normalises errors
  auth/                AuthProvider, context, useAuth
  hooks/               useBackendStatus — polls /health for the offline banner
  lib/image.js         client-side downscaling before upload
  components/          one file per section, plus Navbar/Footer/AuthDialog
  App.jsx              composition only
```

Every backend failure reaches the UI as an `ApiError` carrying the API's
machine-readable `code`, so components can add specific guidance — for example,
pointing out that Vikendi and Sanhok are no longer supported — on top of the
server's own sentence.

Accounts are optional. Predictions are unlimited whether or not you are signed
in; auth exists so usage can be attributed and so a paid tier has something to
hang off later.

## Netlify

- `public/_redirects` handles SPA routing.
- The contact form uses Netlify Forms: the static copy in `index.html` is what
  Netlify parses at deploy time, and the React form in `src/components/Contact.jsx`
  is what users see. Keep the field names in sync.
