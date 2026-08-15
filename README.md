# FUSTA Result Management Portal

Full-stack result management system for Federal University of Science & Technology, Ankpa.

**Stack:** React (Vite) · Node.js/Express · PostgreSQL · Prisma ORM · JWT auth

## Architecture

```
fusta-portal/
├── backend/          Express API — auth, results, role-based access
│   ├── prisma/        Database schema + seed script
│   └── src/
│       ├── config/     DB client
│       ├── controllers/ Business logic
│       ├── middleware/  Auth guards, validation, error handling
│       ├── routes/      Route definitions
│       └── utils/       Logger, tokens, AppError
└── frontend/          React app
    └── src/
        ├── context/     Auth state
        ├── lib/          API client, design tokens
        ├── components/   Shared UI (Seal, etc.)
        └── pages/        Login, StudentDashboard
```

## Security notes (why it's built this way)

- Passwords are hashed with bcrypt (never stored plain).
- Access tokens are short-lived JWTs (15 min); refresh tokens are opaque random
  strings stored **hashed** in the database, delivered via an `httpOnly` cookie
  so they can't be read by JavaScript (mitigates XSS token theft).
- A student can only ever fetch results tied to their own `req.user.sub` —
  there's no endpoint that trusts a client-supplied student ID for "my results."
- Grades are computed server-side from `score`, never accepted from the client.
- Rate limiting on `/api/auth/*` blunts brute-force login attempts.

## Setup — GitHub Codespaces (recommended)

1. Open this repo in a Codespace.
2. Start Postgres:
   ```bash
   docker run --name fusta-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fusta_portal -p 5432:5432 -d postgres:16
   ```
3. Backend:
   ```bash
   cd backend
   cp .env.example .env      # edit JWT secrets — openssl rand -hex 32
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run dev                # runs on :4000
   ```
4. Frontend (new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev                # runs on :5173, proxies /api to :4000
   ```
5. Codespaces will prompt to forward ports 4000 and 5173 — open 5173.

## Setup — Termux

Same steps as above work in Termux, but Postgres via Docker isn't available.
Use a free managed Postgres instance instead (e.g. Render, Neon, Supabase) —
put its connection string in `backend/.env` as `DATABASE_URL` and skip the
`docker run` step.

## Demo accounts (after `npm run seed`)

| Role      | Email                     | Password       |
|-----------|---------------------------|----------------|
| Student   | student@fusta.edu.ng      | Student@123    |
| Lecturer  | lecturer@fusta.edu.ng     | Lecturer@123   |
| Registrar | registrar@fusta.edu.ng    | Registrar@123  |

## Deploying

- **Backend:** Render.com Web Service, add a managed Postgres instance, set
  the env vars from `.env.example` in Render's dashboard, build command
  `npm install && npx prisma migrate deploy`, start command `npm start`.
- **Frontend:** Render Static Site or Vercel, build command `npm run build`,
  publish directory `dist`. Set `CORS_ORIGIN` on the backend to the deployed
  frontend URL.

## What's built

- **Student:** sign in, view results by semester, live GPA/CGPA, class of degree.
- **Lecturer:** sign in, search any student, publish a score for their own
  courses (grade + grade point derived server-side).
- **Registrar:** sign in, full transcript lookup for any student, create new
  login accounts for students/lecturers/registrars — profile record (Student
  or Lecturer) is created in the same transaction, so there's no half-set-up
  account state.
- Auth: register/login/refresh/logout, role guards, rate limiting, validation,
  structured logging throughout.
