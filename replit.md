# Salt N Papper Restaurant Website

## Overview

A production-ready, mobile-first restaurant website for "Salt N Papper" - a vegetarian North Indian restaurant. The application provides online ordering, table reservations, and an admin panel for managing menu items, orders, and reservations. Built with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - TanStack Query (React Query) for server state and API data caching
  - Zustand for client-side cart state with localStorage persistence
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for page transitions and UI animations
- **SEO**: React Helmet for meta tag management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: REST API with typed route definitions in `shared/routes.ts`
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: scrypt for password hashing with timing-safe comparison

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - defines users, categories, menu items, orders, and reservations
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components including shadcn/ui
│       ├── pages/        # Route pages (Home, Menu, Checkout, etc.)
│       ├── hooks/        # Custom hooks (auth, cart, menu, orders)
│       └── config/       # Restaurant configuration
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations interface
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle database schema
│   └── routes.ts     # API route type definitions
```

### Key Design Patterns
- **Shared Types**: Schema and route definitions are shared between frontend and backend via `@shared/*` path alias
- **Type-Safe API**: Zod schemas validate both request inputs and response outputs
- **Component Library**: shadcn/ui provides accessible, customizable UI primitives
- **Mobile-First**: Responsive design targeting mobile users primarily

### Authentication Flow
- Admin login via `/admin` route with username/password
- Session cookies with secure settings for production (HTTPS, SameSite=none)
- Protected admin routes at `/admin/dashboard` for managing orders, menu, and reservations

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Third-Party Services
- **Google Maps**: Embedded map on contact page via iframe (URL configured in `client/src/config/restaurant.ts`)

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `zustand`: Client state management for cart
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `passport` / `passport-local`: Authentication
- `express-session`: Session management
- `framer-motion`: Animations
- `react-helmet`: SEO meta tags
- `wouter`: Client-side routing

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: (Optional) Secret for session encryption, defaults to fallback value