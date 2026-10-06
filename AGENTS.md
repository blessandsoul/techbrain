# Techbrain agent instructions

## MUST FOLLOW — comment important code

Every implementation change MUST include a human-readability pass. Add or update concise comments or doc comments for important functionality and for non-obvious contracts, invariants, edge cases, business rules, security boundaries, deployment constraints, performance choices, and workarounds. Explain why and what must remain true; do not narrate obvious syntax. Keep comments accurate and remove stale ones.

<!-- project-facts:start -->
## Project facts

> Maintained by the `seed-project-facts` skill. This section is the source of truth for this project: keep it true. If your work changes any line (deployment, URLs, hosting, databases, Redis, integrations, rules), update it and the seed-plugins registry row in the same change. If it conflicts with reality, trust reality, fix it, and tell Tornike. No secrets here.

- **Name:** techbrain
- **Purpose:** Catalog/storefront site with products, portfolio projects, blog articles, inquiries and orders, plus an admin panel; online cart ordering is currently paused
- **Production:** client https://techbrain.ge / server https://api.techbrain.ge
- **Hosting:** Coolify florca
- **Local MySQL:** `techbrain_db` on per-project container
- **Production MySQL:** `techbrain_db` on shared MySQL on florca
- **Redis:** local yes / production yes
- **Talks to:** none
- **Special rules:** `.developer-role` (`frontend` | `backend` | `fullstack`) makes the `.claude/hooks/restrict-paths.sh` hook block Edit/Write on the other side's directory; `fullstack` means no restriction. Switch with the `role` skill.
<!-- project-facts:end -->

## Architecture and sources of truth

- `client/` is a Next.js App Router application; `server/` is a Fastify API backed by Prisma/MySQL and Redis. They deploy independently, each from its own Dockerfile.
- The server owns authorization, business rules, and security validation. Client validation exists for UX and is never a trust boundary.
- `server/prisma/schema.prisma` is the database-schema source of truth. Use Prisma migrations for schema changes.
- `server/src/config/env.ts` defines valid server environment variables. The client reads `NEXT_PUBLIC_*` values directly (there is no client env module). Keep `.env.example` and `.env.example.production` in both apps synchronized with `.env`, without real credentials.
- Shared route/API constants (`client/src/lib/constants/routes.ts`, `api-endpoints.ts`), response helpers (`server/src/shared/responses/`), and security middleware are canonical; extend them instead of creating competing shapes or duplicate policy.
- Postman: every new or changed server endpoint must be reflected in `server/postman/collection.json`. `server/postman_collection.json` is an older copy; do not update both.

## Naming

- Use functional kebab-case for project names and anything surfaced in CLIs, logs, queues, jobs, or worker/process names.
- Use camelCase for TypeScript values/functions, PascalCase for components/types/classes, and UPPER_SNAKE_CASE for true constants.
- Keep domain folders and route paths lowercase and functional; follow the scoped client/server naming rules below.

## Carried-over project rules

- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`), imperative mood, subject under 72 characters, one logical change per commit.
- **TypeScript:** strict mode in both apps; no `any` (use `unknown`); explicit return types; `import type` for type-only imports.
- **Database:** new main-entity models carry `id` (`@default(uuid())`), `createdAt`, and `updatedAt`. Renaming a column directly drops its data: add the new column, migrate the data, and drop the old column in a later migration.
- **Client UI:** mobile-first Tailwind (base classes target mobile, `md:`/`lg:` enhance), touch targets at least 44x44px, and no functionality reachable only through hover.
- **Client components:** at most 250 lines, 5 props, and 3 levels of JSX nesting; split a component instead of exceeding them.

## Deployment boundaries

- The Dockerfile in each app is its production contract. Re-check it when changing ports, entry points, build output, native dependencies, runtime files, health routes, or environment variables.
- The client must retain Next.js `output: "standalone"`. Every `NEXT_PUBLIC_*` value is public and compiled into the bundle at build time. The client Dockerfile currently declares no `ARG`/`ENV` for them, so confirm how production supplies `NEXT_PUBLIC_API_BASE_URL` before changing the build.
- The server container runs non-root, applies `prisma migrate deploy` in `server/entrypoint.sh` before `node dist/server.js`, and exposes unauthenticated `GET /api/v1/live` for orchestration. Add explicit Alpine packages for new native runtime dependencies (the image already needs a JPEG decoder for Sharp).
- `server/docker-compose.yml` is local-development infrastructure only, not a production topology. Its published ports are not loopback-bound, so never run it on a server.

## Non-obvious security rules

- Never commit `.env` files, credentials, tokens, or production data. Never place a secret in `NEXT_PUBLIC_*` or client-side code.
- Authentication uses server-issued httpOnly cookies (`access_token`, `refresh_token`). Do not copy tokens into localStorage, sessionStorage, Redux, logs, URLs, or response bodies. The `auth_session` cookie is a non-httpOnly `1` flag for the Next.js middleware and must never carry a token.
- Validate every external input at the server boundary with Zod, use Prisma parameterization, enforce authorization in server services/routes, and return user-safe errors.
- Production CORS is an allowlist from `CORS_ORIGIN`, and public/auth-sensitive endpoints are rate limited (`server/src/config/rate-limit.config.ts`). Preserve both.
- Known gap: auth cookies are `SameSite=None` in production and there is no separate Origin check on state-changing requests, so CORS is the only cross-origin guard. Do not loosen it; add an Origin check if you touch this area.
- Everything under `server/uploads/` is served publicly at `/uploads/`. Never store private or owner-scoped files there.

## Required server security workflow

- For every meaningful server implementation, bug fix, refactor, dependency update, or configuration change, use the repository-local `security-audit` skill in guidance mode while designing and reviewing the change. Treat authentication, authorization, validation, database access, outbound requests, uploads, cookies, CORS/origin handling, rate limits, environment configuration, and deployment behavior as security-sensitive surfaces.
- Before completion, review the current working-tree patch with the agent's own security scan when available: in Codex use the Codex Security plugin's `codex-security:security-diff-scan` skill; in Claude Code run `/security-review`. Scope the review to the changed server behavior and the supporting code needed to establish impact; do not expand it into an unrelated repository audit.
- If that scan is unavailable, perform an equivalent focused patch review with the bundled `security-audit` skill and explicitly report that the scan was unavailable. Do not skip the security gate silently.
- A full or deep repository audit remains explicit work: do not start one merely because ordinary server code changed. Fix confirmed in-scope findings, rerun affected checks, and disclose any unresolved or unverified security concern before claiming completion.
- Documentation-only, comment-only, and formatting-only changes may skip the patch scan when they cannot affect runtime behavior, permissions, deployment, or security policy.

## Verification

Run the smallest relevant lint, typecheck, test, and build commands in each affected app (`npm run lint`, `npm test`, `npm run build` in `client/` and `server/`). Database and deployment changes also require migration/Docker compatibility checks.
