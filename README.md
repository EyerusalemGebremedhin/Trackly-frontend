# Trackly Frontend

Next.js frontend for **Trackly** (dashboard, tasks, groups & discussion, direct messages, profile, check-ins, AI chat/insights).

## Stack
- **Next.js** (App Router) + React + TypeScript
- Tailwind CSS, `lucide-react` icons
- `react-markdown`/`remark-gfm`, `recharts`

## Setup
```bash
cd frontend  # or repo root if this is the standalone frontend repo
npm install
cp .env.local.example .env.local  # if present, then edit
```

## Run
```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # run production build
npm run lint
```

## Environment
Point the app at the Trackly API (variable name may be `NEXT_PUBLIC_API_URL` or similar, check `lib/api.ts` / `.env*` in this repo). Example:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Notes
- Auth uses a bearer token stored client-side; log in via the app against the backend.
- Messages/DMs and group discussion poll for updates (no WebSocket). Media URLs resolve against the API base.

## Related
- Backend: https://github.com/EyerusalemGebremedhin/Trackly-backend
