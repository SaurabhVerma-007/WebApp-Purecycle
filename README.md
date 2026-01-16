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

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database
- [VS Code](https://code.visualstudio.com/) (recommended)

### Environment Setup

1. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/purecycle
   SESSION_SECRET=your-session-secret
   AI_INTEGRATIONS_OPENAI_API_KEY=your-openai-api-key
   AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

### Installation & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   npx drizzle-kit push
   ```

3. Start the application:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`.

### Debugging in VS Code

1. Open the project in VS Code.
2. Create a `.vscode/launch.json` file:
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
3. Press `F5` to start debugging. You can set breakpoints in `server/routes.ts` or `server/storage.ts`.
4. For frontend debugging, use the **Chrome Debugger** extension in VS Code and point it to `http://localhost:5000`.

