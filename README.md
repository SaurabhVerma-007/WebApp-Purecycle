# PureCycle
A privacy-focused menstrual cycle tracking app with AI health guidance.

🌐 **https://webapp-purecycle-production.up.railway.app/**

## Features
- Cycle & symptom tracking
- AI health guide (Groq AI) with access to your cycle data
- Calendar visualization
- Dark mode
- Secure authentication

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **AI**: Groq (llama-3.3-70b-versatile)
- **Hosting**: Railway

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
   SESSION_SECRET=your-random-secret
   NODE_ENV=development
   ```

3. Push schema and start:
   ```bash
   npm run db:push
   npm run dev
   ```

App runs at **http://localhost:5000**

Demo: `username: demo` / `password: demo123`

## Deployment (Railway)
1. Push to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add the same env variables + `NODE_TLS_REJECT_UNAUTHORIZED=0`
4. Build: `npm install && npm run build` — Start: `npm run start`
5. Railway auto-deploys on every push

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:push` | Push schema to Supabase |
