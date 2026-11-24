# MacroBuddy

AI-powered meal suggestions that hit your macro targets. Set your protein, carbs, fat and calories (or let onboarding calculate them from your stats) and MacroBuddy suggests meals, finds fast-food alternatives, saves favorites and plans your day.

## Features

- **Onboarding + profile** – goal, stats and activity level produce daily macro targets (Mifflin-St Jeor); editable any time
- **Meal suggestions** – recipes with ingredient-level macros, filterable by cuisine and meal type
- **Fast food finder** – closest menu matches to your macros across 45+ chains
- **Favorites** and a **daily meal plan** (breakfast / lunch / dinner per date)
- Email/password and Google sign-in, dark/light mode, account deletion

## Stack

React 19 (Create React App) + Tailwind · Express · MongoDB (Mongoose) · Groq (Llama 3.3 70B, via the OpenAI SDK)

## Getting started

Requires Node 20+ and a MongoDB instance (or use Docker below).

```bash
npm install
cp server/.env.example server/.env   # then fill in the values
npm run dev                          # API on :3001, app on :3000
```

Or with Docker (starts MongoDB too): `docker compose up --build`

### Environment variables

Server (`server/.env`):

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign login tokens |
| `GROQ_API_KEY` | yes (for AI) | Free key from [console.groq.com](https://console.groq.com) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Enables Google sign-in. Authorized redirect URI: `<server>/api/auth/google/callback` |
| `CLIENT_URL` | no | Frontend origin for CORS and OAuth redirects (default `http://localhost:3000`) |
| `PORT` | no | API port (default `3001`) |

Client (build-time): `REACT_APP_API_URL` – API base URL (default `http://localhost:3001`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API and React dev server together |
| `npm run server` | API only |
| `npm start` / `npm run build` | React dev server / production build |
| `npm test` | Client tests (Jest + Testing Library) |
| `npm run test:server` | API tests (node:test + supertest, in-memory MongoDB; first run downloads a MongoDB binary) |

## API overview

All routes except `/api/auth/*` and `/api/health` need `Authorization: Bearer <token>`.

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register`, `/login` | Email/password auth |
| `GET /api/auth/google`, `POST /api/auth/google/exchange` | Google OAuth (callback redirects with a one-time code, never the token) |
| `GET /api/auth/me` | Current user |
| `PATCH /api/user/profile`, `DELETE /api/user` | Update profile / delete account and data |
| `POST /api/suggest-meals`, `/api/fastfood-alternatives`, `/api/favorites/suggest` | AI endpoints (30 requests/hour/user) |
| `GET/POST /api/favorites`, `DELETE /api/favorites/:id` | Favorites |
| `GET/POST /api/mealplan`, `DELETE /api/mealplan/:date/:slot` | Meal plan |

## Notes

- Macros come from an LLM and are estimates, not lab-verified nutrition data.
- Not yet implemented: password reset and email verification (need an email provider), and food logging / daily progress tracking.
