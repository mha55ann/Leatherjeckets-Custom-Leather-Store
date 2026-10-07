# Leatherjeckets

A responsive storefront for made-to-order leather jackets. Customers can browse the catalog, save a cart in their browser, configure fit and finish, and send a quote request to the workshop.

## Features in this first release

- Product catalog and product details backed by the shared API and PostgreSQL
- Mobile-friendly shop filters and search
- Persistent browser cart
- Custom jacket quote requests saved to PostgreSQL
- Product choices for leather, color, size, and measurements
- Craftsmanship, shipping, and contact pages

## Run in this workspace

The project uses the workspace's managed API and database services:

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/leatherjeckets run dev
```

The API expects `DATABASE_URL`, supplied by the managed database environment.

## Download the source

Use the **Download source** link in the storefront footer. It downloads `public/leatherjeckets-source.zip`, which contains the workspace code needed to run the storefront and shared API.

## Important launch notes

The storefront does not claim to process payment, calculate import tax/duty, or buy courier labels. Those services need to be verified for the business and configured before accepting live international payments or promising landed costs. Customs classification and origin details should be confirmed with a qualified broker.
