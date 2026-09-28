# MediBridge

MediBridge is a hospital patient portal. Patients activate the account the
hospital created for them, book and manage appointments with doctors, browse
departments, and chat with an AI support assistant. It is an npm-workspaces
monorepo with a Vite React frontend and a TypeScript Express API.

## Repository map

```text
apps/
  web/                 Vite + React 19 + Tailwind frontend (@medibridge/web)
  api/                 TypeScript Express + MongoDB API (@medibridge/api)
    src/               Routes, controllers, models, services, seeds
    assets/            Images uploaded by the seed scripts
packages/
  shared/              Types shared by web and api (@medibridge/shared)
docs/
  architecture/        System and API decisions
  collaboration/       Team workflow and ownership
.github/               CI, issue and pull-request templates
```

## Getting started

```powershell
npm install
copy apps\api\.env.example apps\api\.env   # then fill in the values
copy apps\web\.env.example apps\web\.env
npm run dev
```

`npm install` must be run from the repository root; it installs every workspace
into a single `node_modules` and `package-lock.json`.

| Command                 | What it does                                 |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Runs the API and the web app together        |
| `npm run dev:api`       | Runs only the API (nodemon + ts-node)        |
| `npm run dev:web`       | Runs only the web app (Vite)                 |
| `npm run typecheck`     | Type checks every workspace                  |
| `npm run build`         | Builds every workspace                       |
| `npm run lint`          | Lints every workspace that has a lint script |

Seed the database from the API workspace:

```powershell
npm run seed:users -w @medibridge/api
npm run seed:doctors -w @medibridge/api
npm run seed:departments -w @medibridge/api
```

## Deployment

| App        | Platform | Root directory | Build              | Start / output         |
| ---------- | -------- | -------------- | ------------------ | ---------------------- |
| `apps/web` | Vercel   | `apps/web`     | `npm run build`    | `dist`                 |
| `apps/api` | Render   | `apps/api`     | `npm run build`    | `npm start`            |

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
