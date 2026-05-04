# Twin Unity

Twin Unity is a custom marketplace for buying, selling, and trading Pokemon cards. The site combines a public storefront with a protected admin workflow for managing listings, inventory status, images, and purchase/trade intent.

The core website is near launch. Remaining business decisions are the shared listing/contact email address and the final checkout provider. Stripe is currently one possible checkout option, but the production payment flow is not finalized.

## Deployment

Twin Unity is intended to be deployed on Vercel. The current public deployment can use the generated `*.vercel.app` URL until a custom production domain is ready.

## Features

- Public storefront for browsing Pokemon card listings by category, search, newest arrivals, and sold inventory.
- Listing detail pages with image galleries, pricing, availability, and purchase actions.
- Cart flow for collecting purchasable listings before checkout.
- Protected admin dashboard for creating, editing, drafting, publishing, and marking listings as sold.
- Supabase-backed data, authentication, and storage.
- Typed validation and shared listing models across the app.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase database, auth, and storage
- Zod validation
- Checkout integration under evaluation

## Project Status

Twin Unity is built as a portfolio-quality production app for a real Pokemon card marketplace. The storefront, admin listing workflow, inventory states, and core data model are in place. Before launch, the project still needs:

- A shared email address for listing, trade, and customer communication.
- A final checkout decision, such as Stripe, Shopify, or a manual/contact-based flow.

## Admin Workflow

Admins sign in at `/admin` with a Supabase Auth account whose email is included in `ADMIN_EMAILS`. Listings can be saved as `draft`, `published`, or `sold`.

Listing intent controls how inventory appears to customers:

- `buy`: available for purchase when price and quantity are set.
- `sell`: used for cards or collections Twin Unity is looking to buy.
- `trade`: used for trade targets or tradeable inventory.

<details>
<summary>Development setup</summary>

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=owner@example.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Run the Supabase SQL in `supabase/schema.sql` from the Supabase SQL editor.

5. Create an admin user in Supabase Auth. The email must be included in `ADMIN_EMAILS`.

6. Start the app:

```bash
npm run dev
```

### Checkout Notes

Checkout is intentionally still under evaluation. The repository currently includes Stripe-related code as one possible implementation path, but the final production provider may change before launch.

For local Stripe testing, forward events to:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the generated webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

The current Stripe webhook listens for:

- `checkout.session.completed` to mark orders paid and reduce listing quantity.
- `checkout.session.expired` to mark pending orders cancelled.

### Deployment

Deploy to Vercel and add the same environment variables in the Vercel project settings. Update `NEXT_PUBLIC_SITE_URL` to the production domain.

If Stripe is used for production checkout, configure the webhook endpoint to point to:

```text
https://your-domain.com/api/stripe/webhook
```

</details>
