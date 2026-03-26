# FlockMate

All-in-one poultry farm management platform. Track production cycles, manage inventory, log daily reports, analyze financials, and coordinate your team — all in one place.

## Setup

### Prerequisites
- Node.js 18+
- A Supabase project (see `.env.example` for required keys)

### Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anonymous (public) key

### Database Seeding

Seed the reference data tables (categories, brackets, etc.):

```bash
npm run seed:schema
```

### Development Server

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS, Recharts
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **State:** Zustand

## Project Structure

```
src/
├── components/     # UI components (layout, sheets, shared, cycles, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utilities, Supabase client, queries, guards
├── pages/          # Route-level page components
├── stores/         # Zustand state stores
└── types/          # TypeScript type definitions
```
