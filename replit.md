# PureCycle - Menstrual Cycle Tracking Application

## Overview

PureCycle is a privacy-focused web application designed to help women track their menstrual cycles, predict upcoming periods, and receive AI-driven health insights. The application provides cycle tracking, daily symptom logging, calendar visualization with color-coded cycle phases, and an AI-powered health guide chatbot.

Target users are women aged 13-45 seeking period tracking, symptom analysis, and personalized wellness guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (soft pinks/purples palette)
- **Forms**: React Hook Form with Zod validation
- **Calendar**: react-day-picker for cycle visualization
- **Date Utilities**: date-fns for date manipulation

The frontend follows a pages-based structure in `client/src/pages/` with shared components in `client/src/components/`. Custom hooks in `client/src/hooks/` encapsulate data fetching logic using React Query.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy (username/password)
- **Session Management**: Express sessions with scrypt password hashing
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe validation

The server handles authentication, cycle/log CRUD operations, and AI chat interactions. Routes are registered in `server/routes.ts` with storage abstraction in `server/storage.ts`.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` defines users, cycles, and dailyLogs tables
- **Migrations**: Managed via drizzle-kit (`npm run db:push`)

Key tables:
- `users`: Authentication and profile data with tracking mode preference
- `cycles`: Period start/end dates per user
- `dailyLogs`: Daily symptoms, mood, flow intensity, and specialized mode data (fertility, PCOS)

### Authentication Flow
- Session-based authentication using express-session
- Passport local strategy validates username/password
- Protected routes check session on the server; frontend redirects unauthenticated users to `/auth`

### AI Integration
- Uses OpenAI API via Replit AI Integrations
- Configured through environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Chat endpoint at `POST /api/ai/chat` provides personalized health guidance
- Additional replit_integrations modules available for batch processing, image generation, and conversation storage

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session store for PostgreSQL

### AI/ML Services
- **OpenAI API**: Powers the AI health guide chatbot via Replit AI Integrations
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Authentication
- **SESSION_SECRET**: Required environment variable for session encryption

### Key npm Packages
- **drizzle-orm/drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Async state management
- **react-day-picker**: Calendar component for cycle visualization
- **date-fns**: Date manipulation library
- **zod**: Runtime type validation shared between client and server
- **Radix UI**: Accessible component primitives (via Shadcn UI)