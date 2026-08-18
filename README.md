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

Database is **PostgreSQL (Neon)**. Set `DATABASE_URL` and `AUTH_SECRET` in `.env` and on Vercel.

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
