# NG LMS

Full-stack student learning dashboard for tracking course progress, time spent, learning trends, adaptive next steps, and mentor oversight.

## Features

- Email authentication with **student** and **mentor** roles (JWT)
- Student dashboard: completed lessons, time spent, progress per course
- Charts: 14-day learning trend + completion donut
- Course / lesson flow with start, log time, and mark complete
- Adaptive next-step recommendations
- CSV export of progress
- Mentor dashboard for assigned students
- Interactive Swagger API docs
- Seeded demo data

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) + TypeScript + Tailwind CSS + Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Sequelize |
| Database | PostgreSQL |

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL

### 1. Database

```bash
createdb ng_lms
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
npm install
npm run dev
```

- API: http://localhost:4000  
- Health: http://localhost:4000/api/health  
- Swagger: http://localhost:4000/api/docs  

With `DB_SYNC=true` and `DB_SEED=true`, schema sync and demo seed run on boot.

Re-seed:

```bash
cd backend && npm run seed
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `student@demo.com` | `Demo@12345` | Student |
| `mentor@demo.com` | `Demo@12345` | Mentor |
| `rahul@demo.com` | `Demo@12345` | Student |

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `4000`) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CORS_ORIGIN` | Frontend origin (`http://localhost:5173`) |
| `DB_SYNC` | Sync schema on boot (`true` for local demo) |
| `DB_SEED` | Seed demo data if missing (`true` for local demo) |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend URL (`http://localhost:4000`) |

## Project structure

```text
ng-hackathon/
├── backend/          Express + Sequelize API
├── frontend/         React (Vite) app
└── README.md
```

## API documentation

- Swagger UI: http://localhost:4000/api/docs  
- OpenAPI JSON: http://localhost:4000/api/docs.json  

1. `POST /api/auth/login` with `student@demo.com` / `Demo@12345`
2. Click **Authorize** and paste the JWT
3. Try protected endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/dashboard/summary` | Student | KPIs |
| GET | `/api/dashboard/timeseries` | Student | Time series |
| GET | `/api/dashboard/distribution` | Student | Donut data |
| GET | `/api/courses` | Yes | Courses |
| GET | `/api/courses/:id` | Yes | Course detail |
| GET | `/api/lessons/:id` | Yes | Lesson detail |
| PATCH | `/api/lessons/:id/progress` | Student | Update progress |
| POST | `/api/activities` | Student | Log activity |
| GET | `/api/recommendations` | Student | Next steps |
| GET | `/api/export/progress.csv` | Student | CSV export |
| GET | `/api/mentor/students` | Mentor | Student list |
| GET | `/api/mentor/students/:id/dashboard` | Mentor | Student dashboard |

## Reviewer walkthrough

1. Login as `student@demo.com` / `Demo@12345`
2. View dashboard charts and recommendations
3. Open a course → lesson → log time / mark complete
4. Login as `mentor@demo.com` / `Demo@12345` → open a student
