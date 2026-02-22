# PureCycle - Client Requirements

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview of cycle status, predictions, and recent logs |
| Calendar | `/calendar` | Visual calendar with cycle phase color coding |
| Daily Log | `/log` | Form to log flow, symptoms, mood, and notes |
| AI Chat | `/chat` | AI health guide powered by Groq |
| Settings | `/settings` | Profile, appearance (dark mode), notifications |
| Auth | `/auth` | Login and registration |

## Packages
| Package | Purpose |
|---------|---------|
| react-day-picker | Customizable calendar component for cycle tracking |
| date-fns | Essential for date manipulation and formatting |
| recharts | For visualizing cycle history and trends |
| framer-motion | For smooth page transitions and micro-interactions |
| clsx | Utility for conditional class names |
| tailwind-merge | Utility for merging Tailwind classes |
| next-themes | Dark mode theme switching |
| groq-sdk | Groq AI API client for chat assistant |
| @tanstack/react-query | Server state management and API mutations |
| wouter | Lightweight client-side routing |
| react-hook-form | Form state management and validation |
| zod | Schema validation shared between client and server |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user` | Auth check, returns current user |
| POST | `/api/login` | Login with username/password |
| POST | `/api/register` | Register new user |
| POST | `/api/logout` | Logout current user |
| GET | `/api/cycles` | Get all cycles for current user |
| POST | `/api/cycles` | Create new cycle |
| PUT | `/api/cycles/:id` | Update existing cycle |
| GET | `/api/daily-logs` | Get all daily logs for current user |
| POST | `/api/daily-logs` | Create new daily log |
| PUT | `/api/daily-logs/:id` | Update existing daily log |
| POST | `/api/ai/chat` | Send message to Groq AI (SSE streaming) |
| PATCH | `/api/user/mode` | Update user tracking mode |

## Tracking Modes
| Mode | Focus |
|------|-------|
| standard | General cycle tracking and symptom management |
| fertility | Fertile windows, BBT, cervical mucus |
| pcos | PCOS symptoms, hormonal balance |
| pregnancy | Fetal development, prenatal health |

## Notes
- Backend provides `/api/user` for auth check
- AI Chat uses `POST /api/ai/chat` with SSE streaming response
- AI has access to user's cycle history and daily logs for personalized responses
- Cycle tracking relies on correct date formatting (`YYYY-MM-DD`)
- Theme focuses on soft pinks/purples with high readability
- Dark mode implemented via `next-themes` + Tailwind `darkMode: ["class"]`
- Chat history persists across navigation using `sessionStorage`, clears on logout
- Database: Supabase (PostgreSQL) via Drizzle ORM
- All scripts use `cross-env` for Windows compatibility