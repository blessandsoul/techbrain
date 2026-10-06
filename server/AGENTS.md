# Server agent instructions

## Architecture and naming

- Request flow is route → controller → service → repository → Prisma. Routes register HTTP/schema metadata; controllers translate HTTP input/output; services own business rules; repositories contain database queries only.
- Domain modules live in `src/modules/<domain>/` with `<domain>.routes.ts`, `.controller.ts`, `.service.ts`, `.repo.ts`, `.schemas.ts`, and `.types.ts` when needed.
- All API routes use the `/api/v1` prefix. Use the shared `successResponse` and `paginatedResponse` helpers (`src/shared/responses/`) and typed `AppError` subclasses rather than custom response/error shapes.
- Use the shared logger (`src/libs/logger.ts`) and outbound HTTP client (`src/libs/http.ts`). Never add ad-hoc `console.log`, raw `fetch`, or per-call axios clients that bypass redaction, timeouts, and error mapping.

## Sources of truth

- `prisma/schema.prisma` owns models, relations, indexes, and database naming. Change schema through reviewed Prisma migrations; production is forward-only with `prisma migrate deploy`. Prisma stays on 6.x; do not upgrade to 7.x without testing.
- `src/config/env.ts` owns runtime configuration validation. Keep `.env.example` and `.env.example.production` synchronized, but keep real secrets out of the repository and image.
- Zod route schemas own external input validation. Services own authorization and business invariants; repositories must not decide access policy.

## Security and deployment

- Preserve httpOnly cookie auth, production CORS allowlists, rate limiting, safe client IP handling (`src/libs/client-ip.ts`), generic 500 responses, and server-side-only diagnostic logging. There is currently no Origin check on state-changing requests; see the root `AGENTS.md` known gap.
- Use Prisma parameterization and explicit safe projections; never expose password hashes, tokens, internal errors, or secret-bearing upstream payloads.
- `uploads/` is served publicly at `/uploads/`. Do not put private files there; a private file needs an authenticated, owner-scoped route outside the static root, with filename/path validation.
- The production image runs non-root, applies `prisma migrate deploy` in `entrypoint.sh` before `node dist/server.js`, and probes unauthenticated `GET /api/v1/live`. Preserve writable ownership for runtime storage and add explicit Alpine packages for new native runtime dependencies.

## Mandatory security completion gate

- Follow the root `AGENTS.md` security workflow for every meaningful server change: use `security-audit` guidance during implementation and run `codex-security:security-diff-scan` (Codex) or `/security-review` (Claude Code) on the resulting patch.
- Review the concrete trust boundary, attacker-controlled input, affected principal/resource, authorization decision, validation point, and observable impact. Missing best practices without a reachable boundary failure are hardening notes, not confirmed vulnerabilities.
- Add or update focused regression coverage for changed authorization, validation, origin/CORS, cookie/session, upload/path, outbound-request, and data-isolation behavior. Never rely on client checks as security evidence.
- If a required security check cannot run, state the exact blocker and safe follow-up instead of reporting the server change as fully verified.
