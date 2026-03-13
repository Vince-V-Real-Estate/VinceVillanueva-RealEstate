# VV Realtor

A modern real estate website built with the latest web technologies, featuring property listings, mortgage calculator, and appointment bookings along with a mobile-first responsive design.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) — React framework with App Router and Turbopack
- **Authentication**: [Better Auth](https://www.better-auth.com/) — Secure authentication with email/password and OAuth support
- **Database**: [PostgreSQL](https://www.postgresql.org/) — Production-grade relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) — Lightweight TypeScript ORM for PostgreSQL
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS framework
- **Validation**: [Zod](https://zod.dev/) — TypeScript-first schema validation
- **UI Components**: [ShadCN](https://ui.shadcn.com/) — Accessible, customizable UI components
- **Runtime**: [Bun](https://bun.sh/) — All-in-one JavaScript runtime and package manager

## Features

- 🏠 **Property Listings** — Browse available properties for sale and rent
- 🔐 **User Authentication** — Secure sign-up/sign-in with email/password
- 👤 **User Account Management** — Update profile, manage sessions, delete account
- 📱 **Responsive Design** — Fully optimized for mobile, tablet, and desktop
- 🎨 **Modern UI** — Clean, professional design with Tailwind CSS

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Docker](https://www.docker.com/) (for local PostgreSQL)

### Installation

```bash
# Install dependencies
bun install

# Start development services (PostgreSQL)
bun run docker:up

# Push schema to database
bun run db:push

# Start development server
bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/vv_realtor
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
```

## Available Scripts

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `bun run dev`          | Start development server        |
| `bun run build`        | Build for production            |
| `bun run start`        | Start production server         |
| `bun run check`        | Run lint and type checks        |
| `bun run format:check` | Check code formatting           |
| `bun run docker:up`    | Start PostgreSQL container      |
| `bun run docker:down`  | Stop PostgreSQL container       |
| `bun run db:push`      | Push schema changes to database |
| `bun run db:generate`  | Generate Drizzle types          |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── account/           # User account page
├── components/            # React components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── sections/          # Page sections (Hero, etc.)
│   └── ui/               # ShadCN UI components
├── lib/                   # Utilities and helpers
│   └── zod/              # Zod validation schemas
├── server/                # Server-side code
│   ├── better-auth/       # Authentication configuration
│   └── db/               # Database schemas and connection
└── utils/                 # Utility functions
```
