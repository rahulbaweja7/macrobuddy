# Claude Code Session — MacroBuddy Full-Stack Build

**Project:** MacroBuddy — AI-powered macro tracking and meal planning app  
**Stack:** React 19, Express 4, MongoDB, Tailwind CSS, OpenAI-compatible APIs  
**Session length:** ~4 hours across multiple conversations  

---

## What I asked

> "Go through the entire project and understand it. Then implement: MongoDB schemas for users/meals/favorites/mealPlans, JWT auth, wire the meal planning page to real data, and Docker Compose."

## What Claude did

Read every file in the repo, then in one pass:

- Designed and created `server/models/User.js`, `Favorite.js`, `MealPlan.js` with proper compound indexes (`{ userId: 1, date: 1 }` unique on MealPlan to prevent duplicate day entries)
- Wrote `server/middleware/auth.js` — JWT Bearer extraction, verified against secret, attaches `req.userId`
- Rewrote `server/index.js` (455 lines) — all in-memory arrays replaced with real MongoDB queries, all routes auth-protected
- Rewrote `MealPlanPage.js` from static UI to fully wired: `useEffect` + `useCallback` fetches plan on date change, modal with two tabs (pick from favorites / generate new), save/remove via real API calls
- Fixed a critical dotenv scoping bug: `require('dotenv').config()` defaults to CWD (project root), not `server/.env` — fixed with `{ path: path.join(__dirname, '.env') }`
- Wrote `docker-compose.yml` with health checks: React depends on nothing, Express waits for Mongo healthy

**Deleted:** 0 existing features. Everything already working continued to work.

---

## What I asked next

> "Why don't we have Google OAuth?"

## What Claude did

- Added `passport-google-oauth20` strategy with account linking logic: find by `googleId` → fall back to email match → create new user
- Added `/api/auth/google` and `/api/auth/google/callback` routes
- Created `AuthContext.js` — on mount, checks URL for `?token=&user=` params (OAuth redirect), stores in localStorage, cleans URL with `window.history.replaceState` so refresh doesn't re-trigger
- Created `LoginPage.js` and `RegisterPage.js` with Google button
- Exported `GOOGLE_AUTH_URL` from `api.js` so the URL is never hardcoded

Debugged three OAuth failures in sequence:
1. Server not running when visiting the OAuth URL directly
2. `CLIENT_URL` pointed to port 3000 but React runs on 3002 (root `.env` has `PORT=3002`)
3. Hardcoded `localhost:3001` in the Google button — replaced with the exported constant

---

## What I asked next

> "The app doesn't look professional. Fix it."

## What Claude did

Rewrote every page and component with a consistent design system:

- `MealCard.js` — macro proportion bar (violet/amber/emerald segments showing P/C/F ratio), pill badges, expandable ingredient table with colored columns, numbered instructions
- `FastFoodCard.js` — orange left border, delta badges (red = over target, green = under)
- `MealSuggestionsPage.js` — large underline-style macro inputs (`text-3xl font-black` with colored bottom borders), cuisine as pill buttons instead of dropdown, skeleton loading cards while AI generates
- `HomePage.js` — iterated 3 times on request; final version: centered hero, `DailyPlanCard` showing a full day (breakfast/lunch/dinner) with macro bars, editorial numbered feature list instead of generic icon grid
- Navbar — responsive hamburger, active states, pill indicator

---

## What I asked next

> "Add dark mode and light mode."

## What Claude did

- Added `darkMode: 'class'` to `tailwind.config.js`
- Created `ThemeContext.js` — reads from `localStorage`, defaults to dark, toggles `dark` class on `<html>`, persists preference
- Added sun/moon toggle button to Navbar
- Updated **14 files** with `dark:` Tailwind variants — every page, every component, login/register, the calendar widget (CSS overrides in `index.css` for `react-calendar`)
- The hero section always renders dark (intentional product design); stats strip and features respond to theme

Zero regressions. Every component works in both modes.

---

## What I asked next

> "Switch from OpenAI to Grok — it's free right?"

## What Claude built / debugged

- Switched `baseURL` to `https://api.x.ai/v1`, model to `grok-3-mini` — 3 lines changed, everything else identical (xAI is OpenAI-compatible)
- Requests kept hitting `api.openai.com` — diagnosed: OpenAI SDK reads `OPENAI_API_KEY` from system environment and overrides `baseURL` when `apiKey` resolves to undefined
- Tested the xAI key directly via `curl` — returned: *"Your newly created team doesn't have any credits or licenses yet"*
- Pivoted to **Groq** (groq.com) — actually free, same OpenAI-compatible interface, runs Llama 3.3 70b, 30 req/min free tier
- Switched `baseURL` to `https://api.groq.com/openai/v1`, model to `llama-3.3-70b-versatile`

---

## Numbers

| | Before | After |
|---|---|---|
| Auth | Hardcoded users array | JWT + Google OAuth + MongoDB |
| Data persistence | In-memory, resets on restart | MongoDB with proper indexes |
| Meal Plan page | Static UI, no backend | Fully wired: fetch/save/delete |
| Design system | Inconsistent, generic | Unified dark/light theme, 14 files |
| AI provider | OpenAI (paid) | Groq / Llama 3.3 (free) |
| Files touched | 0 | 30+ |

---

## What made this work

Claude read the entire codebase before touching anything. Every change preserved existing behavior. When debugging, it ran actual `curl` commands and `node -e` tests to verify hypotheses before changing code — not guessing.

