# Client agent instructions

## Architecture and naming

- Use Server Components by default. Add `'use client'` only for browser APIs, hooks, local state, or event handlers.
- Put routes in `src/app/`, domain behavior in `src/features/<domain>/` (`components/`, `hooks/`, `services/`, `types/`, `constants/`), reusable primitives in `src/components/ui/`, and cross-domain components in `src/components/common/` or `src/components/layout/`.
- Components use `PascalCase.tsx`, hooks use `use<Name>.ts`, services use `<domain>.service.ts`, types use `<domain>.types.ts`, and Redux slices use `<domain>Slice.ts`.

## Sources of truth

- Server-rendered page data belongs in Server Components; client-fetched server data belongs in React Query; Redux is limited to the authenticated-user lifecycle (`features/auth/store/authSlice.ts`); local and URL state stay local or in search params.
- `src/lib/constants/routes.ts` and `api-endpoints.ts` own application and API paths.
- `src/app/globals.css` owns theme and color tokens. Components use semantic Tailwind tokens (`bg-primary`, `text-foreground`); do not hardcode hex/rgb values or create competing theme variables.
- Security headers and the Content-Security-Policy are set in `next.config.ts` `headers()`. `src/middleware.ts` only guards `/admin/*` (redirects to login without a session). Keep a single CSP source; do not add a second one in middleware.

## Security and deployment

- Treat client validation as UX only; the server must validate and authorize every request.
- Use the shared credentialed axios client (`src/lib/api/axios.config.ts`, `withCredentials`). Auth tokens remain in httpOnly cookies and must never enter browser storage or Redux.
- Sanitize any intentionally rendered HTML and untrusted URLs. Never log passwords, tokens, credentials, or complete sensitive user objects.
- Preserve `output: "standalone"`, the non-root container, and the root health check. `NEXT_PUBLIC_*` values are compiled into the bundle at build time; check how the Dockerfile/Coolify supplies a new one before relying on it.
