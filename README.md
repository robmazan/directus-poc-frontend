# directus-frontend

A server-rendered Express/EJS web app that provides a custom frontend for a self-hosted [Directus](https://directus.io/) CMS. Users authenticate through a login form; credentials are verified against the Directus API and subsequent requests use a server-managed session — the Directus instance is never exposed directly to the browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Server | [Express 5](https://expressjs.com/) (Node.js ESM) |
| Language | TypeScript 5 |
| Templates | EJS 5 |
| CMS backend | [Directus](https://directus.io/) (self-hosted) |
| Directus SDK | `@directus/sdk` v21 |
| Session storage | `express-session` (in-memory, 1 h TTL) |
| Client bundler | esbuild |
| Dev runner | `tsx` (watch mode) |
| Database | PostgreSQL 16 |
| Container runtime | Podman + Podman Compose |

## Prerequisites

- **Node.js** ≥ 20 (ESM support required)
- **Podman** and **Podman Compose**

## Getting Started

### 1. Start the backend services

```bash
podman compose up -d
```

This starts PostgreSQL and Directus. The Directus admin UI will be available at `http://localhost:8055` (`admin@example.com` / `admin`).

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values (see [Environment Variables](#environment-variables) below).

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DIRECTUS_URL` | Yes | URL of the Directus instance (e.g. `http://localhost:8055`) |
| `DIRECTUS_TOKEN` | Yes | Static admin token — used only by the `apply-schema` script |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies |
| `PORT` | No | Port the Express server listens on (default: `3000`) |
| `NODE_ENV` | No | Set to `production` to enable `secure` + `sameSite` cookies |

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Express with hot reload via `tsx --watch` |
| `npm run build` | Bundle client JS (esbuild) + compile server TS (`tsc`) |
| `npm run build:client` | Bundle `src/client/main.ts` → `public/js/bundle.js` |
| `npm run build:server` | Compile server TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/server/index.js`) |
| `npm run apply-schema` | Sync `scripts/schema.json` to the live Directus instance |

## Production

```bash
npm run build
npm start
```

## Schema Management

Directus schema is version-controlled in [`scripts/schema.json`](scripts/schema.json). To apply it to a running Directus instance, set `DIRECTUS_TOKEN` in your `.env` and run:

```bash
npm run apply-schema
```

The script uses the Directus SDK's `schemaDiff` + `schemaApply` to apply only the changes needed, making it safe to run repeatedly.

## Architecture Notes

- **Session-stored tokens** — After login, the Directus `access_token` and `refresh_token` are stored server-side in the Express session (delivered to the browser as an `httpOnly` cookie). The SDK's storage adapter reads/writes directly from `req.session.directusAuth`, so token auto-refresh is transparent to route handlers.
- **Two Directus client factories** (`src/server/services/directus.ts`):
  - `createDirectus()` — unauthenticated client used for the login flow.
  - `getAuthedClient(req)` — session-hydrated client with auto-refresh 30 s before expiry.
- **`requireAuth` middleware** — Guards protected routes; stores `returnTo` in the session so users are redirected back after login.
- **Dev vs prod path resolution** — `__dirname` is resolved at startup so `views/` and `public/` are located correctly whether running via `tsx` (source tree) or `node dist/` (compiled output).
