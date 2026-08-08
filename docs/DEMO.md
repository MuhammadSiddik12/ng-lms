# NG LMS — Demo Script & Judging Notes

## 3-minute demo script

### 0:00–0:30 → Problem
> Students and mentors can’t see learning progress in one place. Time spent, completion, and “what should I do next?” are scattered or invisible — so learners stall and mentors intervene too late.

### 0:30–1:00 → Solution
> **NG LMS** is a progressive learning dashboard. Students track lessons, time, and trends; get adaptive next steps; export progress. Mentors monitor assigned learners with the same visual insights.

### 1:00–2:15 → Live demo
1. Open `http://localhost:5173` → brand landing → **Sign in**
2. Login as `student@demo.com` / `Demo@12345`
3. Show **Dashboard**: KPIs, **Next steps**, trend chart, completion donut, course bars
4. Click **Export CSV** (quick win)
5. Open **Courses** → TypeScript → in-progress lesson → **+5 min** → **Mark complete**
6. Return to dashboard — progress/recommendations update
7. Log out → login `mentor@demo.com` / `Demo@12345`
8. Open a student → show mentor KPIs + charts

### 2:15–2:40 → Technical architecture
> React + Express + Sequelize + PostgreSQL. JWT auth with student/mentor roles. Aggregates and time-series from SQL. Rule-based recommendations (no AI dependency for reliability). Seeded demo data for instant judging.

### 2:40–3:00 → Impact + future
> Mentors intervene earlier; students always know the next action. Next: invite flows, real content player, optional LLM copy for recommendations, background jobs for heavy analytics.

---

## What will impress judges?
- End-to-end working product (not slides)
- Dual-role story (student + mentor)
- Real charts from seeded activity data
- Adaptive recommendations that feel smart
- Clean API + seed + docs

## Strongest differentiator
Rule-based **Next steps** tied to real progress + inactivity patterns — demoable without flaky AI.

## Demo this
Student dashboard → complete a lesson → mentor view of that student

## Avoid demoing (if unstable)
- Fresh registration edge cases under rate limits
- Gemini/AI (not included — keep demo deterministic)

## Final 1–2 hours additions (if time)
- Screenshots in README
- One automated smoke test in CI
- Mentor note / flag on a student

## Impact × Demo value × Effort ranking
1. Student charts + KPIs (shipped)
2. Mentor dashboard (shipped)
3. Recommendations (shipped)
4. CSV export (shipped)
5. Optional AI phrasing (skip unless spare time)
