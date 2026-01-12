# PureCycle - Menstrual Cycle Tracking Application

PureCycle is a privacy-focused web application designed to help women track their menstrual cycles, predict upcoming periods, and receive AI-driven health insights.

## Features

- **Cycle Tracking**: Log period start/end dates and flow intensity.
- **Daily Logs**: Record symptoms, mood, and health notes.
- **AI Health Guide**: Personalized, mode-specific health guidance using OpenAI.
- **Calendar Visualization**: Color-coded visualization of cycle phases.
- **Privacy-Focused**: Secure authentication and local data management.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Wouter.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **AI**: OpenAI via Replit AI Integrations.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `SESSION_SECRET`: Secret for session management.
   - `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key.

3. Push database schema:
   ```bash
   npx drizzle-kit push:pg
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
