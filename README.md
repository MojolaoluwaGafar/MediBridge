# MediBridge

MediBridge is a hospital patient portal. Patients activate the account the
hospital created for them, book and manage appointments with doctors, browse
departments, and chat with an AI support assistant. It is an npm-workspaces
monorepo with a Vite React frontend and a TypeScript Express API.

## Repository map

```text
apps/
  Client/              Vite + React 19 + Tailwind frontend (@medibridge/client)
  Server/              TypeScript Express + MongoDB API (@medibridge/server)
    src/               Routes, controllers, models, services, seeds
    assets/            Images uploaded by the seed scripts
packages/
  shared/              Types shared by Client and Server (@medibridge/shared)
docs/
  architecture/        System and API decisions
  collaboration/       Team workflow and ownership
.github/               CI, issue and pull-request templates
```

## Getting started

```powershell
npm install
copy apps\Server\.env.example apps\Server\.env   # then fill in the values
copy apps\Client\.env.example apps\Client\.env
npm run dev
```

`npm install` must be run from the repository root; it installs every workspace
into a single `node_modules` and `package-lock.json`.

| Command               | What it does                                 |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Runs the Server and the Client together      |
| `npm run dev:server`  | Runs only the Server (nodemon + ts-node)     |
| `npm run dev:client`  | Runs only the Client (Vite)                  |
| `npm run typecheck`   | Type checks every workspace                  |
| `npm run build`       | Builds every workspace                       |
| `npm run lint`        | Lints every workspace that has a lint script |

Seed the database from the Server workspace:

```powershell
npm run seed:users -w @medibridge/server
npm run seed:doctors -w @medibridge/server
npm run seed:departments -w @medibridge/server
```

## Deployment

| App           | Platform               | Build (from repo root) | Start / output |
| ------------- | ---------------------- | ---------------------- | -------------- |
| `apps/Server` | Render web service     | `npm ci --include=dev && npm run build -w @medibridge/server` | `npm run start -w @medibridge/server` |
| `apps/Client` | Render static site     | `npm ci --include=dev && npm run build -w @medibridge/client` | `apps/Client/dist` |

Both are defined as a Render Blueprint in [`render.yaml`](./render.yaml).
In Render, choose **New → Blueprint** and pick this repository. Render asks for
the secret values (database URL, API keys) on the first deploy, and then
deploys `main` automatically once CI passes. Both build from the repo root
because the workspaces share one `package-lock.json`.

On the first deploy, the client needs the API's URL:

1. Let `medibridge-api` finish deploying and copy its URL
   (for example `https://medibridge-api.onrender.com`).
2. Set it as `VITE_BASE_URL` on `medibridge-client` (no trailing slash) and
   redeploy the client. Vite builds the URL into the app, so changing it
   always needs a redeploy.

The API already accepts requests from `medibridge-client*.onrender.com`. For a
custom domain, add it to `CORS_ORIGINS` on the API.

The Client can still be deployed to Vercel instead (root directory
`apps/Client`, build `npm run build`, output `dist`, `vercel.json` handles
routing). Set `VITE_BASE_URL` there the same way.

## Git workflow

All work happens on a feature branch created from `test`. Pull requests target
`test`; `test` is merged into `main` for releases.

```powershell
git switch test
git pull origin test
git switch -c feature/123-doctor-dashboard
git push -u origin feature/123-doctor-dashboard
```

Read [the contribution guide](./CONTRIBUTING.md) before making your first
change.
