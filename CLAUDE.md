# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

This is a Next.js 14 wedding planning application with App Router, using:
- **Database**: Drizzle ORM with libsql/SQLite (local `wedding.db` file or Turso in production)
- **Auth**: NextAuth v5 beta with credentials provider (username/password)
- **UI**: Tailwind CSS v4 + Radix UI primitives in `src/components/ui/`

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (REST endpoints)
│   └── [feature]/page.tsx # Feature pages (guests, budget, seating, etc.)
├── components/
│   ├── ui/                # Radix-based UI primitives
│   ├── dashboard-layout.tsx
│   └── sidebar.tsx
└── lib/
    ├── db/
    │   ├── index.ts       # Database client + initialization
    │   └── schema.ts      # Drizzle schema definitions
    └── auth.ts            # NextAuth configuration
```

### Key Patterns

- **API routes** use raw SQL via `client.execute()` rather than Drizzle query builder
- **Database initialization** runs on app start (`src/lib/db/index.ts`) - creates tables and seeds default data if empty
- **All pages** use `DashboardLayout` wrapper component
- **Middleware** (`src/middleware.ts`) handles auth redirects - unauthenticated users go to `/login`

### Database Schema

Core tables: `users`, `wedding_events`, `guests`, `guest_events` (many-to-many), `tables`, `budget_categories`, `budget_items`, `tasks`, `vendors`, `wedding_party`, `itinerary_items`, `vision_items`

The app models a multi-day Indian wedding with events: Mehendi, Sangeet, Haldi, Wedding & Reception.

## Environment

Copy `.env.example` to `.env.local`. For local development, the default `file:wedding.db` works. For production, configure Turso credentials.
