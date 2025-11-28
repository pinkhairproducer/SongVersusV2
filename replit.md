# SongVersus - Music Battle Platform

## Overview

SongVersus is a competitive music platform where producers and artists can battle against each other by uploading tracks and letting the community vote on winners. The application features real-time battles, a leaderboard system, virtual currency (coins), chat functionality, and gamification elements like a slot machine mini-game.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React** using **TypeScript** and **Vite** as the build tool. The application uses a component-based architecture with the following key decisions:

**UI Framework**: Uses shadcn/ui components (Radix UI primitives) with Tailwind CSS for styling. The design system follows a "New York" style variant with extensive customization for a dark, futuristic music platform aesthetic.

**Routing**: Implements client-side routing with `wouter`, a lightweight alternative to React Router. Routes are defined in `App.tsx` and include pages for battles, leaderboard, artists, producers, store, profile, and settings.

**State Management**: 
- Uses React Context (`UserContext`) for global user state management
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Local state with React hooks for component-level state

**Animation**: Framer Motion is used for animations and transitions throughout the UI, particularly in battle cards and interactive elements.

**Authentication**: Simple authentication system stored in localStorage. User credentials are managed through the `UserContext` provider, with login/signup handled via API calls.

### Backend Architecture

The backend is an **Express.js** server written in TypeScript with the following design:

**Server Structure**: 
- Entry point at `server/index.ts` sets up Express middleware and HTTP server
- Routes defined in `server/routes.ts` handle all API endpoints
- Static file serving configured in `server/static.ts` for production builds
- Development mode uses Vite middleware (`server/vite.ts`) for hot module replacement

**API Design**: RESTful API endpoints organized by resource:
- `/api/auth/*` - User authentication (signup, login)
- `/api/battles/*` - Battle CRUD operations
- `/api/votes/*` - Voting functionality
- `/api/comments/*` - Battle comments
- `/api/chat/*` - Global chat messages
- `/api/leaderboard` - User rankings

**Data Access Layer**: Abstracted through a storage interface (`IStorage`) implemented by `DatabaseStorage` class. This provides methods for all database operations and allows for potential future storage implementations.

**Validation**: Uses Zod schemas (from `drizzle-zod`) for runtime validation of incoming request data, with helpful error messages via `zod-validation-error`.

### Data Storage

**Database**: PostgreSQL via **Neon Database** (serverless Postgres)

**ORM**: **Drizzle ORM** with the following schema design:

- **users** table: Stores user profiles with name, role (producer/artist), coins, XP, wins, avatar, and password
- **battles** table: Tracks battles with left/right contestants, vote counts, status, and timestamps
- **votes** table: Records individual user votes on battles
- **comments** table: Stores user comments on battles
- **chatMessages** table: Global chat messages

**Schema Management**: Uses Drizzle Kit for migrations, with schema defined in `shared/schema.ts` and migration configuration in `drizzle.config.ts`.

**Connection Pooling**: Uses `@neondatabase/serverless` with WebSocket connections for optimal serverless performance.

### Build System

**Development**:
- Vite dev server runs on port 5000 for frontend
- tsx runs the Express server with hot reload
- Concurrent development of frontend and backend

**Production**:
- Frontend built with Vite to `dist/public`
- Backend bundled with esbuild to `dist/index.cjs`
- Selective bundling: critical dependencies are bundled, others externalized to reduce cold start times
- Static assets served by Express in production

**Path Aliases**: Configured in both `tsconfig.json` and `vite.config.ts`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI framework
- **Express**: Backend web framework
- **TypeScript**: Type safety across the stack
- **Vite**: Frontend build tool and dev server

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: TypeScript ORM
- **drizzle-zod**: Zod schema generation from Drizzle schemas
- **ws**: WebSocket library for Neon database connections

### UI Component Libraries
- **@radix-ui/react-***: Headless UI components (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, popover, scroll-area, select, separator, slider, switch, tabs, toast, tooltip, etc.)
- **tailwindcss**: Utility-first CSS framework
- **@tailwindcss/vite**: Vite plugin for Tailwind CSS v4
- **lucide-react**: Icon library
- **cmdk**: Command menu component
- **embla-carousel-react**: Carousel component

### Animation & Interactivity
- **framer-motion**: Animation library
- **class-variance-authority**: CSS variant management
- **clsx** / **tailwind-merge**: Utility for conditional className joining

### Data Fetching & Forms
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation
- **zod-validation-error**: User-friendly Zod error messages

### Routing
- **wouter**: Lightweight client-side routing

### Utilities
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation

### Development Tools
- **@replit/vite-plugin-***: Replit-specific Vite plugins for development banners, error modals, and cartographer
- Custom `vite-plugin-meta-images.ts`: Updates OpenGraph meta tags with Replit deployment URLs

### Build Tools
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution for development