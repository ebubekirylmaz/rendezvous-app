# Book Appointment

A full-stack appointment booking app for small service businesses (salons, spas, tutors, clinics) — a self-serve alternative to managing bookings over WhatsApp or phone calls.

Customers pick a service, see real availability, and book in under a minute. The business owner manages everything — calendar, services, working hours, manual bookings — from a protected admin dashboard.

🔗 **Live demo:** _add your deployed URL here_
🔑 **Admin demo login:** `admin@bloombeautystudio.com` / `demo1234`

## Features

**Customer booking page** (`/[business-slug]`)
- Mobile-first, four-step wizard: service → date & time → contact info → confirmation
- Real-time availability computed from the business's working hours and existing bookings (no double-booking)
- Fully responsive — a full-screen flow on phones, a centered card on desktop

**Admin dashboard** (`/admin`)
- Email/password authentication (NextAuth, bcrypt-hashed passwords) with every `/admin/*` route protected by middleware
- Weekly calendar (FullCalendar) with color-coded services, manual appointment creation, and one-tap cancellation
- Services CRUD — add, edit, deactivate, or delete (deletion is blocked if a service has existing bookings)
- Business settings: name, public booking link, contact info, and per-day working hours
- Responsive layout: sidebar navigation on desktop, a bottom tab bar on mobile

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| Database | PostgreSQL ([Neon](https://neon.tech)) via [Prisma 7](https://www.prisma.io) (driver adapter) |
| Auth | [NextAuth.js](https://authjs.dev) (Credentials provider) |
| Calendar | [FullCalendar](https://fullcalendar.io) |

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)

### Setup

```bash
git clone https://github.com/ebubekirylmaz/rendezvous-app.git
cd rendezvous-app
npm install
```

Create a `.env.local` file:

```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="run: openssl rand -base64 32"
```

Set up the database and seed a demo business:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Run the dev server:

```bash
npm run dev
```

- Customer booking page: [http://localhost:3000/bloom-beauty-studio](http://localhost:3000/bloom-beauty-studio)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) — `admin@bloombeautystudio.com` / `demo1234`

## Project structure

```
src/
  app/
    [slug]/            # Public booking page + confirmation route
    admin/(dashboard)/  # Protected admin: calendar, services, settings
    admin/login/         # Admin sign-in
    api/auth/            # NextAuth route handler
  actions/               # Server Actions (appointments, services, business, auth)
  components/
    booking/             # Customer-facing booking wizard
    admin/                # Admin dashboard UI
    ui/                   # shadcn/ui primitives
  lib/                    # Prisma client, auth config, data access, availability logic
  proxy.ts                # Route protection for /admin/* (Next.js 16's middleware)
prisma/
  schema.prisma           # Business / Service / Appointment models
  seed.ts                 # Demo data seed script
```

## Deployment

Deploys cleanly to [Vercel](https://vercel.com) — connect the GitHub repo and set `DATABASE_URL` and `AUTH_SECRET` as environment variables. Every push to `main` triggers a new production deploy automatically.

## Roadmap

- [ ] Email notifications (new booking → business, reminder → customer)
- [ ] Multi-tenant support (currently single-business)
