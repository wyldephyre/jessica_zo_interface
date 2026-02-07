# Jessica ZO Interface

Jessica cognitive interface — chat UI (Next.js) and backend (Hono + Claude).

## Structure

- **jessica-frontend** — Next.js app (port 3000). Chat UI and Zustand store; talks to the backend.
- **jessica-backend** — Hono API (port 3001). `/api/jessica/chat` and health check; uses Anthropic.

## Getting started

1. **Backend** (terminal 1):  
   `cd jessica-backend && npm install && npm run dev`  
   Set `ANTHROPIC_API_KEY` in the environment.

2. **Frontend** (terminal 2):  
   `cd jessica-frontend && npm install && npm run dev`

3. Open [http://localhost:3000](http://localhost:3000).

From the repo root you can run:

- `npm run dev:backend` — start backend
- `npm run dev:frontend` — start frontend

(Install dependencies in each folder first with `npm install` in `jessica-frontend` and `jessica-backend`.)
