# RIQF (Regata Internacional Queima das Fitas)

## Overview

This is a mobile-first application named **RIQF** for the **XLIII Regata Internacional Queima das Fitas 2026**, a rowing regatta event. The app provides event information, race programs, live results, notifications, and a contact form for attendees. It also includes an admin panel for managing races, results, notifications, schedule entries, and messages.

The project uses a monorepo structure with an **Expo/React Native** frontend (supporting iOS, Android, and Web) and an **Express.js** backend, sharing a common schema definition via Drizzle ORM connected to **PostgreSQL**.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54 with expo-router for file-based routing
- **Navigation**: Tab-based layout with 5 tabs (Event/Home, Program, Results, Notifications, Contact) plus a separate Admin screen
- **State Management**: TanStack React Query for server state; React Context for admin authentication
- **Styling**: React Native StyleSheet with a custom color palette defined in `constants/colors.ts`
- **Fonts**: Montserrat (multiple weights) loaded via `@expo-google-fonts`
- **Key UI Libraries**: expo-blur, expo-linear-gradient, expo-image, expo-haptics, react-native-reanimated, react-native-gesture-handler

### Routing Structure
- `app/(tabs)/` — Main user-facing tabs: `index.tsx` (home), `program.tsx` (race list), `results.tsx` (completed races), `notifications.tsx` (announcements), `contact.tsx` (contact form)
- `app/admin.tsx` — Admin panel for CRUD operations on races, results, notifications, and messages
- `app/_layout.tsx` — Root layout wrapping everything in QueryClientProvider, AdminProvider, GestureHandlerRootView, and KeyboardProvider

### Backend (Express.js)
- **Location**: `server/` directory
- **Entry**: `server/index.ts` sets up Express with CORS handling (supports Replit domains and localhost)
- **Routes**: `server/routes.ts` defines REST API endpoints for races, race entries, notifications, contact messages, and admin auth
- **Storage**: `server/storage.ts` uses Drizzle ORM with `node-postgres` (pg) pool connection
- **Authentication**: Simple Basic Auth for admin endpoints — credentials stored in database, validated via `requireAdmin` middleware. No session management; credentials stored client-side via expo-secure-store (native) or localStorage (web)

### API Structure
- `POST /api/admin/login` — Admin login
- `GET /api/races` — List all races with entries
- `GET /api/races/:id` — Single race detail
- `POST /api/races` — Create race (admin)
- `PUT /api/races/:id` — Update race (admin)
- `DELETE /api/races/:id` — Delete race (admin)
- `POST /api/races/:id/entries` — Add race entry (admin)
- `PUT /api/entries/:id` — Update entry (admin)
- `DELETE /api/entries/:id` — Delete entry (admin)
- `POST /api/import` — Bulk import races from JSON (admin)
- `PUT /api/races/:id/results` — Save results for a race, auto-creates notification (admin)
- `GET /api/notifications` — List notifications (includes read status)
- `GET /api/notifications/unread-count` — Get count of unread notifications
- `POST /api/notifications` — Create notification (admin)
- `PUT /api/notifications/:id/read` — Mark notification as read
- `DELETE /api/notifications/:id` — Delete notification (admin)
- `GET /api/schedule` — List schedule entries (sorted by sortOrder)
- `POST /api/schedule` — Create schedule entry (admin)
- `PUT /api/schedule/:id` — Update schedule entry (admin)
- `DELETE /api/schedule/:id` — Delete schedule entry (admin)
- `POST /api/contacts` — Submit contact message
- `GET /api/contacts` — List messages (admin)

### Database (PostgreSQL + Drizzle ORM)
- **Schema** defined in `shared/schema.ts` with these tables:
  - `admins` — id, username, password (plaintext — basic setup)
  - `races` — id, raceNumber, time, category, gender, boatType, distance, phase, lanes, createdAt
  - `race_entries` — id, raceId (FK to races with cascade delete), lane, clubName, clubAbbr, crewNames, resultTime, position, status
  - `notifications` — id, title, message, type, read, createdAt
  - `schedule_entries` — id, time, title, icon, sortOrder, createdAt
  - `contact_messages` — id, name, email, phone, subject, message, read, createdAt
- **Migrations**: Drizzle Kit configured in `drizzle.config.ts`, migrations output to `./migrations/`
- **Push command**: `npm run db:push` to sync schema to database
- Domain constants exported from schema: `CATEGORIES`, `GENDERS`, `BOAT_TYPES`, `PHASES`

### Build & Development
- **Dev mode**: Two processes — `expo:dev` for frontend (Expo dev server) and `server:dev` for backend (tsx)
- **Production build**: `expo:static:build` generates static web build via custom `scripts/build.js`; `server:build` bundles server with esbuild; `server:prod` runs the bundled server
- **API URL resolution**: `lib/query-client.ts` dynamically resolves API base URL based on platform and environment variables (`EXPO_PUBLIC_DOMAIN`, localhost detection)

### Shared Code
- `shared/schema.ts` contains Drizzle table definitions and Zod insert schemas (via `drizzle-zod`), shared between server and client
- Path aliases: `@/*` maps to project root, `@shared/*` maps to `./shared/*`

## External Dependencies

### Database
- **PostgreSQL** — Connected via `DATABASE_URL` environment variable, accessed through `pg` (node-postgres) pool and Drizzle ORM

### Key NPM Packages
- **Expo SDK 54** — Core mobile framework with numerous plugins (router, font, image-picker, location, secure-store, etc.)
- **Express 5** — Backend HTTP server
- **Drizzle ORM + drizzle-zod** — Type-safe database ORM with Zod schema generation
- **TanStack React Query** — Client-side data fetching and caching
- **http-proxy-middleware** — Used in development for proxying requests

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (required for server and db:push)
- `REPLIT_DEV_DOMAIN` — Used for CORS and Expo dev server configuration
- `EXPO_PUBLIC_DOMAIN` — Public domain for API URL resolution in the client
- `REPLIT_DOMAINS` — Comma-separated list of allowed CORS origins
- `REPLIT_INTERNAL_APP_DOMAIN` — Used in production build script for deployment domain