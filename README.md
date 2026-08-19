# ProcureX (Pharmstore)

Pakistan-first B2B industrial procurement marketplace. Specs live in `PRD.md`, `TECH_STACK.md`, `FRONTEND_DESIGN.md`, `STEPS.md`.

## Run locally

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Supplier mini-sites (local): [http://abc-engineering.localhost:3000](http://abc-engineering.localhost:3000) is the same page as `/suppliers/abc-engineering`. Marketplace search still uses the path URL (canonical). On a real domain later, add a `*.yourdomain.com` DNS record in Vercel and set `SUPPLIER_SUBDOMAINS=1`.

Database is **PostgreSQL (Neon)**. Copy `.env.example` to `.env`. Set `DATABASE_URL` and `AUTH_SECRET` locally and on Vercel.

### Google login

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → create an **OAuth 2.0 Client ID** (Web application).
2. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://pharm-mart.vercel.app/api/auth/google/callback`
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_URL` (the public origin, no trailing slash) in `.env` and in Vercel **Production** env.
4. Existing email/password users can also click **Continue with Google** with the same email — the accounts are linked.

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### Demo accounts (password `password123`)

| Role | Email |
| --- | --- |
| Admin | sarah.b@example.net |
| Buyer | maria.s@example.com |
| Supplier | laura.c@example.net |

Loop: buyer posts RFQ → admin **Classify + Open + match** → supplier quotes → buyer compares.

Temporary hero photos are from Unsplash until a plant shoot exists.
