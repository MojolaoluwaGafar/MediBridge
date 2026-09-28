# Contributing to MediBridge

We collaborate through small, reviewable pull requests. Do not commit directly
to `main`.

## First-time setup

1. Clone the repository.
2. Run `npm install` in the repository root.
3. Copy `apps/Server/.env.example` and `apps/Client/.env.example` to `.env` and fill
   in the values.
4. Run `npm run typecheck` and `npm run build` before starting work.
5. Read the relevant architecture document in `docs/architecture/`.

## Daily workflow

1. Choose or create a GitHub issue before writing code.
2. Update `test`, then create a branch from it:

   ```powershell
   git switch test
   git pull origin test
   git switch -c feature/123-doctor-dashboard
   ```

3. Keep a branch focused on one issue. Do not mix styling, backend, and
   unrelated cleanup in the same pull request.
4. Run the checks locally:

   ```powershell
   npm run typecheck
   npm run build
   ```

5. Commit using a clear prefix:

   ```text
   feat(server): add doctor appointment endpoints
   fix(client): prevent double booking submission
   docs: document appointment statuses
   chore: update development setup
   ```

6. Push the branch and open a pull request targeting `test`:

   ```powershell
   git push -u origin feature/123-doctor-dashboard
   ```

7. Pull the latest `test` branch before raising or updating a PR:

   ```powershell
   git fetch origin
   git rebase origin/test
   ```

8. Link the issue with `Closes #123`, respond to review comments, and merge
   only after checks and required review pass.

## Where work belongs

| Work type                                          | Location    |
| -------------------------------------------------- | ----------- |
| Browser UI and client API calls                    | `apps/Client/` |
| HTTP routes, services, validation, and persistence | `apps/Server/` |
| Code reused by at least two apps                   | `packages/` |
| Product and technical decisions                    | `docs/`     |
| Repository automation                              | `.github/`  |

Do not copy code between apps. Promote a type or utility to a package only
after it is truly shared.

## Pull-request standards

- Keep changes small enough to review in one sitting.
- Add or update documentation when behavior changes.
- Never commit `.env` files, tokens, credentials, or `node_modules`.
- Do not change the API contract without updating `docs/architecture/api.md`.
- Ask for help early if a change crosses app boundaries.
