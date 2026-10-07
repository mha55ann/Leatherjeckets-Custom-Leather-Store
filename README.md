# Leatherjeckets source

This archive contains the complete Leatherjeckets workspace source: the React storefront, shared Express API, OpenAPI contract and generated client, PostgreSQL schema, sample catalog, and workspace configuration.

## Run in Replit

The project uses the Replit-managed development database and the configured storefront/API workflows. The `DATABASE_URL` is supplied by the environment.

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

Then start the API and web workflows from the Replit project.

## Run outside Replit

Use Node.js 24 and pnpm. Provide your own PostgreSQL database URL through `DATABASE_URL`, then run:

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/leatherjeckets run dev
```

The current release handles product browsing and stores custom jacket inquiries. It does not process payments or calculate import tax, duties, or live courier rates.
