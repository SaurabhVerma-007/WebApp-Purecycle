# PureCycle - Menstrual Cycle Tracking Application

PureCycle is a privacy-focused web application designed to help women track their menstrual cycles, predict upcoming periods, and receive AI-driven health insights.

## Features

- **Cycle Tracking**: Log period start/end dates and flow intensity.
- **Daily Logs**: Record symptoms, mood, and health notes.
- **AI Health Guide**: Personalized health guidance powered by Groq AI with access to your cycle data.
- **Calendar Visualization**: Color-coded visualization of cycle phases.
- **Dark Mode**: Toggle between light and dark themes.
- **Privacy-Focused**: Secure authentication and encrypted data storage.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Wouter
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **AI**: Groq AI (llama-3.3-70b-versatile) with SSE streaming

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Supabase](https://supabase.com/) account (free tier)
- [Groq](https://console.groq.com/) account (free tier)

## Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET=your-random-secret-string
NODE_ENV=development
```

### Getting your keys

**Supabase DATABASE_URL:**
1. Go to [supabase.com](https://supabase.com) → Your project
2. Settings → Database → Connection pooling → Session mode URI

**Groq API Key:**
1. Go to [console.groq.com](https://console.groq.com)
2. API Keys → Create new key

## Installation & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Push database schema to Supabase:
   ```bash
   npm run db:push
   ```

3. Start the application:
   ```bash
   npm run dev
   ```

The application will be available at **http://localhost:5000**

### Demo Account
```
Username: demo
Password: demo123
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to Supabase |
| `npm run check` | TypeScript type checking |

## Project Structure

```
├── client/               # React frontend
│   └── src/
│       ├── pages/        # App pages (dashboard, calendar, chat, etc.)
│       ├── components/   # UI components
│       └── hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes + Groq AI integration
│   ├── db.ts             # Supabase/PostgreSQL connection
│   ├── storage.ts        # Database queries
│   └── auth.ts           # Authentication (Passport.js)
└── shared/               # Shared types and schema
    ├── schema.ts          # Drizzle database schema
    └── routes.ts          # Shared API route definitions
```

## Debugging in VS Code

1. Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "dev"],
         "skipFiles": ["<node_internals>/**"],
         "envFile": "${workspaceFolder}/.env"
       }
     ]
   }
   ```
2. Press `F5` to start debugging with breakpoints.

## Notes

- Chat history persists across page navigation within the same session and clears on logout.
- The AI assistant has access to your cycle and daily log data to provide personalized responses.
- Dark mode preference is saved and applied across the app.