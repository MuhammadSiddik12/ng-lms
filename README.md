# ProgressPulse

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
- [ ] M3 — Authentication
- [ ] M4 — Dashboard / lesson / activity APIs
- [ ] M5 — Student dashboard UI + charts
- [ ] M6 — Course/lesson flow
- [ ] M7 — Recommendations + CSV + mentor UI
- [ ] M8 — Docs, polish, screenshots
