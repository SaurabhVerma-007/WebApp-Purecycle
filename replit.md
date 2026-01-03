# Luna - Menstrual Cycle Tracking Application

## Overview

Luna is a privacy-focused web application designed to help women track their menstrual cycles, predict upcoming periods, and receive AI-driven health insights. The application targets women aged 13-45 seeking period tracking, symptom analysis, and personalized wellness guidance.

Core functionality includes:
- Menstrual cycle tracking with period start/end dates and flow intensity
- Daily symptom and mood logging
- AI-powered chatbot for menstrual health questions (non-diagnostic)
- Calendar visualization with color-coded cycle phases
- Cycle prediction based on historical data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom feminine color palette (soft pinks, purples, sage greens)
- **Forms**: React Hook Form with Zod validation
- **Calendar**: react-day-picker for cycle tracking calendar

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in shared route schemas with Zod validation
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: Scrypt hashing with random salts

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)
- **Tables**: users, cycles, dailyLogs, conversations, messages

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema and Zod insert schemas
- `routes.ts`: API route definitions with input/output schemas
- This enables type-safe API contracts between client and server

### AI Integration
- **Provider**: OpenAI API via Replit AI Integrations
- **Features**: Chat assistant for health questions, configured through environment variables
- **Modules**: Located in `server/replit_integrations/` with chat, image, and batch processing capabilities

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared code

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session store for persistent sessions

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Authentication
- **Session Secret**: `SESSION_SECRET` environment variable (falls back to default in development)

### Key NPM Packages
- **UI**: Full Radix UI component suite, Lucide icons, class-variance-authority
- **Data**: date-fns for date manipulation, recharts for visualization
- **Validation**: Zod throughout for runtime type checking
- **Build**: esbuild for server bundling, Vite for client