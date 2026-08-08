# NG LMS

Full-stack progressive student dashboard for tracking course progress, time spent, learning trends, and mentor insights.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite) + TypeScript + Tailwind CSS + Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Sequelize |
| Database | PostgreSQL |

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL is exposed on **host port `5435`** (mapped to container `5432`) so it does not conflict with other local Postgres services.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:4000`  
Health: `http://localhost:4000/api/health`

On boot (with `DB_SYNC=true` and `DB_SEED=true`), the API syncs the schema and seeds demo data.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## API overview

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register student or mentor |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Bearer JWT | Current user |
| GET | `/api/dashboard/summary` | Student | KPIs + per-course progress |
| GET | `/api/dashboard/timeseries?days=14` | Student | Daily time-spent series |
| GET | `/api/dashboard/distribution?by=status\|category` | Student | Donut chart segments |
| GET | `/api/courses` | Yes | Enrolled courses (students) / all (mentors) |
| GET | `/api/courses/:id` | Yes | Course + lessons + progress |
| GET | `/api/lessons/:id` | Yes | Lesson detail |
| PATCH | `/api/lessons/:id/progress` | Student | Update / complete lesson |
| POST | `/api/activities` | Student | Log activity event |
| GET | `/api/recommendations` | Student | Adaptive next-step recommendations |
| GET | `/api/export/progress.csv` | Student | Download progress CSV |
| GET | `/api/mentor/students` | Mentor | Assigned students + summaries |
| GET | `/api/mentor/students/:id/dashboard` | Mentor | Student dashboard aggregates |

```bash
# Login
curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@demo.com","password":"Demo@12345"}'

# Current user
curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| `student@demo.com` | `Demo@12345` | Student |
| `mentor@demo.com` | `Demo@12345` | Mentor |
| `rahul@demo.com` | `Demo@12345` | Student |

Re-seed from scratch:

```bash
cd backend
npm run seed
```

## Project structure

```text
ng-hackathon/
├── backend/          Express + Sequelize API
├── frontend/         React (Vite) app
├── docker-compose.yml
└── README.md
```

## Milestone status

- [x] M1 — Project setup
- [x] M2 — Database models + seed
- [x] M3 — Authentication
- [x] M4 — Dashboard / lesson / activity APIs
- [x] M5 — Student dashboard UI + charts
- [x] M6 — Course/lesson flow
- [x] M7 — Recommendations + CSV + mentor UI
- [ ] M8 — Docs, polish, screenshots
