# Frontend Framework Scaffold — Design Spec

**Date:** 2026-05-16
**Status:** Approved (pending user review of written spec)

## Goal

Scaffold a Turborepo monorepo containing a Next.js 16 web app and a shared TypeScript package, without changing what Vercel currently deploys to the production URL. Establish the boundary for a future React Native + Expo mobile app.

## Constraints

- The live site at the production Vercel URL must remain byte-identical to today's deploy of `index.html` throughout and after the scaffold.
- `index.html` at the repo root is not moved, renamed, or edited.
- All new code lives under `apps/` and `packages/`.
- No customer-facing functionality is added; this is pure infrastructure setup.

## Non-goals

- Porting `index.html` content into Next.js components (separate later phase).
- Visual redesign (separate later phase).
- Wiring up Clerk, Supabase, Stripe, TanStack Query, React Hook Form, Sentry, or PostHog (each added when its first real consumer exists).
- Mobile app scaffold (added when web has functionality worth sharing).
- Test runner setup (added when the first feature needs tests).

## Repo Layout

```
Sports-Card-Website/
├── index.html                       UNCHANGED. Vercel keeps deploying this.
├── pnpm-workspace.yaml              Declares apps/* and packages/* as workspaces.
├── package.json                     Root dev-deps only (turbo, typescript, prettier).
├── turbo.json                       Turborepo pipeline (dev, build, lint, typecheck).
├── vercel.json                      Pins Vercel to no-build, serve-static behavior.
├── .vercelignore                    Excludes monorepo files from deploy uploads.
├── .prettierrc                      Repo-wide formatting config.
├── apps/
│   └── web/                         Next.js 16 App Router app. NOT deployed yet.
│       ├── src/app/
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── components.json          shadcn/ui config.
│       └── src/lib/utils.ts         shadcn cn() helper.
├── packages/
│   └── shared/                      Empty skeleton for future Zod schemas + TS types.
│       ├── src/index.ts
│       ├── package.json             Name: @sportscards/shared.
│       └── tsconfig.json
├── docs/                            UNCHANGED (Obsidian vault).
├── supabase/                        UNCHANGED.
├── CLAUDE.md                        UNCHANGED.
├── .gitignore                       Appended: node_modules/, .turbo/, .next/, dist/.
└── .vercel/                         UNCHANGED.
```

## Initial Scaffold Contents

### Root

- `pnpm-workspace.yaml`: declares `apps/*` and `packages/*`.
- `package.json`: holds dev-only deps `turbo`, `typescript`, `prettier`. Scripts: `dev`, `build`, `lint`, `typecheck` (delegated to Turborepo).
- `turbo.json`: pipeline definitions for `dev` (persistent), `build`, `lint`, `typecheck`.
- `.prettierrc`: default Prettier config.

### apps/web/

Created via `pnpm create next-app@latest` with:

| Prompt | Answer |
|---|---|
| TypeScript | yes |
| ESLint | yes (Next.js default) |
| Tailwind CSS | yes (Tailwind v4) |
| `src/` directory | yes |
| App Router | yes |
| Turbopack (dev) | yes |
| Import alias | `@/*` |

Then `pnpm dlx shadcn@latest init` with:

| Prompt | Answer |
|---|---|
| Style | default |
| Base color | neutral |
| CSS variables | yes |

Result: `components.json` + `src/lib/utils.ts` (`cn()` helper) exist. No shadcn components installed yet.

### packages/shared/

- `package.json` with name `@sportscards/shared`, private: true.
- `tsconfig.json` for type-checking the package.
- Empty `src/index.ts`.
- No actual code or schemas yet — boundary only.

### What is NOT installed on day 1

- Clerk SDK
- Supabase client (`@supabase/supabase-js`)
- Stripe SDK
- TanStack Query
- React Hook Form
- Zod schemas
- Sentry
- PostHog

Each added when its first real consumer exists, per the project's stated principle of not adding infrastructure ahead of need.

## Vercel Deploy Isolation

The risk: today the Vercel project is set to "Other" preset with no build command, serving `index.html` directly. Once a `package.json` appears at the repo root, Vercel's auto-detect may attempt to run a build, which could change or break the live site.

Mitigations layered together:

**`vercel.json` at repo root:**

```json
{
  "buildCommand": null,
  "installCommand": null,
  "framework": null,
  "outputDirectory": "."
}
```

`vercel.json` overrides dashboard auto-detect, so Vercel cannot promote the monorepo into a Next.js build behind our back.

**`.vercelignore` at repo root:**

```
apps/
packages/
turbo.json
pnpm-workspace.yaml
node_modules/
.turbo/
.next/
```

Vercel's deploy upload excludes the monorepo entirely. The deploy payload stays roughly equivalent to today (index.html plus a handful of root config files).

## Verification Plan

After scaffolding on a branch (not `main`):

1. `node --version` — confirm Node ≥ 20.x.
2. `pnpm install` at root succeeds.
3. `pnpm --filter web dev` — Next.js boots on `localhost:3000`, shows default Next welcome page.
4. `pnpm --filter web build` — production build succeeds.
5. `pnpm --filter web typecheck` — clean.
6. `pnpm --filter web lint` — clean.
7. Push branch to GitHub.
8. Vercel auto-creates a preview deploy of the branch.
9. Compare preview URL response to production URL response. The check is a byte-level comparison of the HTML response body for `/` (e.g., `curl -s <preview-url> > preview.html; curl -s <prod-url> > prod.html; diff preview.html prod.html`). Expected output: no diff.
10. Only merge to `main` after the preview is confirmed byte-identical to production.

If the preview differs from production, do not merge. Investigate root cause, adjust `vercel.json` or `.vercelignore`, repeat.

## Execution Order

Performed on branch `scaffold/nextjs-monorepo`:

1. Add root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `vercel.json`, `.vercelignore`, `.prettierrc`.
2. Append to `.gitignore`: `node_modules/`, `.turbo/`, `.next/`, `dist/`.
3. `cd apps && pnpm create next-app@latest web` with answers above.
4. `cd apps/web && pnpm dlx shadcn@latest init` with answers above.
5. Create `packages/shared/` skeleton (package.json, tsconfig.json, src/index.ts).
6. `pnpm install` at repo root to wire workspaces.
7. Run verification plan locally.

## Git Commits

Staged in logical chunks for clean history:

1. `chore: add turborepo workspace config` — root workspace files.
2. `chore: vercel deploy isolation` — vercel.json, .vercelignore.
3. `feat: scaffold next.js 16 web app` — apps/web/.
4. `chore: init shadcn/ui` — components.json, src/lib/utils.ts.
5. `chore: scaffold shared package` — packages/shared/.
6. `chore: add prettier config` — .prettierrc, root devDep.

## Rollback Plan

If anything goes wrong:

- Pre-merge: throw away the branch. `main` is untouched. Production unaffected.
- Post-merge (unlikely, since verification runs pre-merge): revert the merge commit. Vercel redeploys the prior state of `main`, which is `index.html` only.

## Out of Scope (Explicitly)

The following are deliberately deferred to future, separate specs:

- Porting `index.html` content into Next.js components.
- Visual redesign (logo-themed black + gold palette work).
- Clerk auth integration.
- Supabase client + RLS setup.
- Stripe subscription flows.
- TanStack Query provider + data fetching patterns.
- React Hook Form + Zod schema patterns.
- Sentry + PostHog instrumentation.
- React Native + Expo mobile app scaffold.
- Flipping Vercel root directory to `apps/web/` (the eventual cutover).
- Test runner choice (Vitest, Playwright, etc.).
