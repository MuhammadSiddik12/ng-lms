# NG LMS — API Documentation

Base URL (local): `http://localhost:4000`

## Response format

Success:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "path": "email", "message": "Valid email is required" }]
}
```

CSV export is an exception: it returns raw `text/csv`.

## Authentication

Protected routes require:

```http
Authorization: Bearer <jwt>
```

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create student or mentor account |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Current user profile |

### Register

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alex Student",
    "email": "alex@example.com",
    "password": "Secure123",
    "role": "student"
  }'
```

### Login

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@demo.com","password":"Demo@12345"}'
```

## Student dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/summary` | Student | KPIs + per-course progress |
| GET | `/api/dashboard/timeseries?days=14` | Student | Daily duration series |
| GET | `/api/dashboard/distribution?by=status\|category` | Student | Donut segments |

```bash
TOKEN=<jwt>

curl -s http://localhost:4000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:4000/api/dashboard/timeseries?days=14" \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:4000/api/dashboard/distribution?by=status" \
  -H "Authorization: Bearer $TOKEN"
```

## Courses & lessons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | Yes | Student enrollments / mentor catalog |
| GET | `/api/courses/:id` | Yes | Course detail + lessons + progress |
| GET | `/api/lessons/:id` | Yes | Lesson content + progress |
| PATCH | `/api/lessons/:id/progress` | Student | Update status / time |
| POST | `/api/activities` | Student | Log learning activity |

### Log time

```bash
curl -s -X POST http://localhost:4000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "lessonId": "<lesson-uuid>",
    "eventType": "time_logged",
    "durationSeconds": 600
  }'
```

### Complete lesson

```bash
curl -s -X PATCH http://localhost:4000/api/lessons/<lesson-uuid>/progress \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'
```

## Recommendations & export

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/recommendations` | Student | Adaptive next-step recommendations |
| GET | `/api/export/progress.csv` | Student | CSV download of lesson progress |

```bash
curl -s http://localhost:4000/api/recommendations \
  -H "Authorization: Bearer $TOKEN"

curl -s http://localhost:4000/api/export/progress.csv \
  -H "Authorization: Bearer $TOKEN" -o nglms-progress.csv
```

## Mentor

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/mentor/students` | Mentor | Assigned students + summaries |
| GET | `/api/mentor/students/:id/dashboard` | Mentor | Student KPIs + charts data |

```bash
MENTOR_TOKEN=<mentor-jwt>

curl -s http://localhost:4000/api/mentor/students \
  -H "Authorization: Bearer $MENTOR_TOKEN"

curl -s http://localhost:4000/api/mentor/students/<student-uuid>/dashboard?days=14 \
  -H "Authorization: Bearer $MENTOR_TOKEN"
```

## Health

```bash
curl -s http://localhost:4000/api/health
```
