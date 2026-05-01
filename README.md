# Twin Unity TCG

Twin Unity TCG is a custom marketplace for buying, selling, and trading Pokemon cards. It uses a public storefront, a protected admin dashboard, Supabase for data/auth/storage, and Stripe Checkout for online purchases.

## Stack

- Next.js App Router
- Supabase database, auth, and storage
- Stripe Checkout and webhooks
- TypeScript

## Local Development

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

## Stripe Webhook

For local testing, forward Stripe events to:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the generated webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

The app listens for:

- `checkout.session.completed` to mark orders paid and reduce listing quantity.
- `checkout.session.expired` to mark pending orders cancelled.

## Admin Workflow

Go to `/admin`, sign in with the Supabase admin account, then create or edit listings. Listings can be saved as `draft`, `published`, `sold`, or `archived`.

Use `intent` to control behavior:

- `buy`: shown as purchasable when price and quantity are available.
- `sell`: used for cards or collections Twin Unity is looking to buy.
- `trade`: used for trade targets or tradeable inventory.

## Deployment

Deploy to Vercel and add the same environment variables in the Vercel project settings. Update `NEXT_PUBLIC_SITE_URL` to the production domain and configure the Stripe webhook endpoint to point to:

```text
https://your-domain.com/api/stripe/webhook
```
