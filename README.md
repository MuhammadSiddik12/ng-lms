# NG LMS

Full-stack **progressive student dashboard** for tracking course progress, time spent, learning trends, adaptive next steps, and mentor oversight.

Built for hackathon speed with a demo-ready seed and a complete student → mentor journey.

## Features

**Must-have (shipped)**
- Email auth with **student** and **mentor** roles (JWT)
- Student dashboard: completed lessons, time spent, progress per course
- Visualizations: 14-day trend chart + completion donut
- Lesson detail with start / log time / mark complete
- Activity events powering aggregates
- Seeded sample data + clear setup

**Stretch (shipped)**
- Adaptive rule-based recommendations
- CSV export of progress
- Mentor dashboards (student list + student insight view)
- Responsive UI

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite) + TypeScript + Tailwind CSS + Recharts |
| Backend | Node.js + Express + TypeScript |
| ORM | Sequelize |
| Database | PostgreSQL |

**Why PostgreSQL?** Strong relational model (users ↔ enrollments ↔ courses ↔ lessons ↔ progress ↔ events). Aggregates and time-series are natural SQL. MongoDB was rejected because joins, constraints, and percentage calculations are core to this product.

## Architecture

```text
                ┌──────────────────┐
                │  Student/Mentor  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ React (Vite) UI  │
                │ Tailwind/Recharts│
                └────────┬─────────┘
                         │ REST + JWT
                         ▼
                ┌──────────────────┐
                │ Express API      │
                │ Auth / Aggregates│
                │ Lessons / Events │
                │ Recs / Mentor    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ PostgreSQL       │
                │ (Sequelize ORM)  │
                └──────────────────┘
```

## Quick start

### Prerequisites
- Node.js 20+
- Docker (for Postgres) **or** an existing PostgreSQL instance

### 1. Database

**Option A — Docker (recommended defaults)**

```bash
docker compose up -d
```

Postgres is exposed on host port **5435** (`nglms` / `nglms` / db `nglms`).

**Option B — Your own Postgres**

Point `backend/.env` at your instance (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit if not using Docker defaults
npm install
npm run dev
```

- API: http://localhost:4000  
- Health: http://localhost:4000/api/health  

With `DB_SYNC=true` and `DB_SEED=true`, schema sync + demo seed run on boot.

Re-seed from scratch:

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

| Variable | Purpose | Source |
|----------|---------|--------|
| `PORT` | API port | Default `4000` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Postgres connection | Docker compose or your DB |
| `JWT_SECRET` | Sign access tokens | Generate a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | e.g. `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `DB_SYNC` | `sequelize.sync({ alter })` on boot | `true` in dev only |
| `DB_SEED` | Seed demo data if missing | `true` in demos |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL (`http://localhost:4000`) |

Never commit real secrets. Use `.env.example` as the template.

## Project structure

```text
ng-hackathon/
├── backend/
│   ├── scripts/smoke.sh
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── app.ts
│   │   ├── seed.ts
│   │   └── server.ts
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── .env.example
├── docs/
│   ├── API.md
│   └── DEMO.md
├── docker-compose.yml
└── README.md
```

## API documentation

Full reference with curl examples: **[docs/API.md](./docs/API.md)**

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

## Testing strategy

### Backend smoke (manual / script)

With API running:

```bash
cd backend
chmod +x scripts/smoke.sh
./scripts/smoke.sh
```

Covers: health, student login, dashboard, recommendations, CSV, mentor students.

### Suggested deeper tests (post-hackathon)
- Auth: register duplicate email → 409; bad password → 401
- Authorization: mentor cannot hit student dashboard routes
- Progress update transaction: complete lesson creates activity event
- Frontend: login → dashboard charts render → complete lesson → KPI changes

### Main user flow checklist
1. Landing → login as student  
2. Dashboard charts + recommendations visible  
3. Course → lesson → log time → mark complete  
4. Export CSV downloads  
5. Mentor login → open student dashboard  

## Performance (MVP)

**Implemented now**
- Indexes on `(user_id, created_at)`, enrollments, lesson progress uniqueness
- Dashboard queries scoped by user
- Timeseries filled client-side for missing days (stable charts)

**Later**
- Cache summary endpoints (Redis) for hot dashboards
- Paginate activity history
- Materialized daily rollups for large event tables
- CDN for frontend assets

## Scalability path

| Users | Approach |
|-------|----------|
| 100 | Single API + Postgres (current) |
| 1,000 | Add connection pooling, read replicas optional |
| 10,000 | Horizontal API replicas behind load balancer; Redis cache; object storage for exports |
| 100,000+ | Partition `activity_events`, background workers for aggregates, CDN, observability |

Do **not** over-engineer the hackathon MVP — ship reliable demo path first.

## Deployment (simplest reliable)

| Service | Suggestion | Why |
|---------|------------|-----|
| Frontend | Vercel / Netlify | Fast static React deploy |
| Backend | Render / Railway | Easy Node + env vars |
| Database | Neon / Supabase / Railway Postgres | Managed Postgres |
| Secrets | Platform env vars | No secrets in repo |

Steps (high level):
1. Provision Postgres → set `DB_*` and strong `JWT_SECRET`
2. Deploy backend → set `CORS_ORIGIN` to frontend URL, `DB_SYNC=false` in production (use migrations later)
3. Run seed once for demo (`npm run seed`) or import SQL
4. Deploy frontend with `VITE_API_URL` pointing at the API
5. Verify `/api/health` and demo login

## Cost estimate

### Hackathon / demo (free tiers)

| Service | Purpose | Expected cost |
|---------|---------|---------------|
| Frontend | Hosting | ₹0 (free tier) |
| Backend | API | ₹0–₹500/mo free/hobby |
| Database | Postgres | ₹0 (Neon/Supabase free) |
| AI | Not required | ₹0 |

### Production-scale (indicative)

| Service | Purpose | Expected cost |
|---------|---------|---------------|
| Frontend | CDN hosting | ₹500–2,000/mo |
| Backend | 1–2 small instances | ₹1,500–6,000/mo |
| Database | Managed Postgres | ₹1,500–8,000/mo |
| Redis / workers | Cache & jobs | ₹1,000–4,000/mo |

## Demo & judging

See **[docs/DEMO.md](./docs/DEMO.md)** for the full 3-minute script and judging strategy.

**Fast path:** login student → show charts + recommendations → complete a lesson → switch to mentor → open that student.

## Final technical review (self-score)

| Area | Score | Notes |
|------|------:|-------|
| Architecture | 8 | Clean Express layers; lean for hackathon |
| Code Quality | 8 | Typed services; consistent API responses |
| Security | 8 | bcrypt, JWT, Zod, helmet, rate limits; no refresh tokens yet |
| Database Design | 9 | Relational model + useful indexes |
| API Design | 9 | Consistent envelope; role-aware routes |
| Frontend UX | 8 | Product-like dashboard; responsive |
| Performance | 7 | Fine for demo; add caching at scale |
| Scalability | 7 | Clear path documented; not implemented |
| AI Integration | 6 | Rule engine only (intentional reliability) |
| Testing | 6 | Smoke script; expand automated tests later |
| Deployment | 7 | Documented; not wired to CI/CD |
| Hackathon Potential | 9 | Strong dual-role demo + seeded data |

### Improvements for scores below 8
- **Performance (7):** Cache `/dashboard/summary` for 30–60s per user.  
- **Scalability (7):** Move seed/sync off production boot; add migrations.  
- **AI (6):** Optional Gemini rewrite of recommendation titles with rule fallback.  
- **Testing (6):** Add Vitest/Jest for auth + aggregates; Playwright for main flow.  
- **Deployment (7):** Add GitHub Action smoke against staging.

## Milestone status

- [x] M1 — Project setup  
- [x] M2 — Database models + seed  
- [x] M3 — Authentication  
- [x] M4 — Dashboard / lesson / activity APIs  
- [x] M5 — Student dashboard UI + charts  
- [x] M6 — Course/lesson flow  
- [x] M7 — Recommendations + CSV + mentor UI  
- [x] M8 — Docs, demo script, polish  
