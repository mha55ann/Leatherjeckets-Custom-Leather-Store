# Leatherjeckets

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm --filter @workspace/leatherjeckets run dev` — run the storefront
- `pnpm --filter @workspace/db run push` — apply development schema changes
- `pnpm --filter @workspace/db run seed` — add the sample catalog
- `pnpm --filter @workspace/leatherjeckets run typecheck` — check the storefront
- `pnpm --filter @workspace/api-server run typecheck` — check the API
- `pnpm run typecheck` — check all workspace packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, Vite, Wouter, TanStack Query, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/leatherjeckets/` — customer storefront and generated product photography
- `artifacts/api-server/` — shared Express API
- `lib/api-spec/openapi.yaml` — API contract and code generation source
- `lib/db/src/schema/` — product and custom inquiry tables
- `lib/db/scripts/seed.mjs` — sample product catalog

## Architecture decisions

- Catalog prices are stored in USD cents; customs taxes, duties, and courier rates are not guessed.
- The first release uses quote requests rather than claiming payment, shipping-label, or order-management integrations.
- The quote bag is stored in the customer's browser; submitted inquiries are stored in PostgreSQL.

## Product

Customers can browse made-to-order jacket designs, search and filter the catalog, view product details, save jackets to a quote bag, and send the workshop a custom request with fit and material preferences.

## User preferences

- Keep the public brand name spelled `Leatherjeckets`.
- Include a downloadable ZIP containing the website source code.

## Gotchas

- API routes are under `/api`; keep `lib/api-spec/openapi.yaml` and generated hooks in sync.
- Do not publish assumed tax, duty, HS-code, payment, or courier calculations as confirmed customer costs.
- The source ZIP is served from the storefront's `public/` directory; rebuild it after changing included source files.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
