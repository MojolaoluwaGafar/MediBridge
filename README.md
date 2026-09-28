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

| App           | Platform | Root directory | Build           | Start / output |
| ------------- | -------- | -------------- | --------------- | -------------- |
| `apps/Client` | Vercel   | `apps/Client`  | `npm run build` | `dist`         |
| `apps/Server` | Render   | `apps/Server`  | `npm run build` | `npm start`    |

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
