import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database";
import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";

function assertStudentRole(role: string) {
  if (role !== "student") {
    throw new ApiError(403, "Student dashboard is only available to students");
  }
}

export async function buildStudentSummary(userId: string) {
  const enrollments = await Enrollment.findAll({
    where: { userId },
    include: [{ model: Course, as: "course" }],
  });

  const courseIds = enrollments.map((e) => e.courseId);
  const lessons =
    courseIds.length === 0
      ? []
      : await Lesson.findAll({ where: { courseId: courseIds } });

  const progress = await LessonProgress.findAll({ where: { userId } });
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  let completedLessons = 0;
  let inProgressLessons = 0;
  let timeSpentSeconds = 0;

  for (const p of progress) {
    timeSpentSeconds += p.timeSpentSeconds;
    if (p.status === "completed") completedLessons += 1;
    if (p.status === "in_progress") inProgressLessons += 1;
  }

  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const list = lessonsByCourse.get(lesson.courseId) ?? [];
    list.push(lesson);
    lessonsByCourse.set(lesson.courseId, list);
  }

  const courses = enrollments.map((enrollment) => {
    const courseLessons = lessonsByCourse.get(enrollment.courseId) ?? [];
    const total = courseLessons.length;
    const completed = courseLessons.filter(
      (l) => progressByLesson.get(l.id)?.status === "completed"
    ).length;
    const courseTime = courseLessons.reduce(
      (sum, l) => sum + (progressByLesson.get(l.id)?.timeSpentSeconds ?? 0),
      0
    );

    return {
      id: enrollment.courseId,
      title: enrollment.course?.title ?? "Course",
      category: enrollment.course?.category ?? "General",
      totalLessons: total,
      completedLessons: completed,
      progressPercent: total === 0 ? 0 : Math.round((completed / total) * 100),
      timeSpentSeconds: courseTime,
    };
  });

  const overallLessons = lessons.length;
  const overallPercent =
    overallLessons === 0
      ? 0
      : Math.round((completedLessons / overallLessons) * 100);

  return {
    completedLessons,
    inProgressLessons,
    totalLessons: overallLessons,
    timeSpentSeconds,
    timeSpentHours: Number((timeSpentSeconds / 3600).toFixed(2)),
    enrolledCourses: courses.length,
    overallProgressPercent: overallPercent,
    courses,
  };
}

export async function buildStudentTimeseries(userId: string, days: number) {
  const rows = await sequelize.query<{
    day: string;
    duration_seconds: string;
    event_count: string;
  }>(
    `
    SELECT
      to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
      COALESCE(SUM(duration_seconds), 0)::int AS duration_seconds,
      COUNT(*)::int AS event_count
    FROM activity_events
    WHERE user_id = :userId
      AND created_at >= (NOW() AT TIME ZONE 'UTC') - (:days || ' days')::interval
    GROUP BY 1
    ORDER BY 1 ASC
    `,
    {
      replacements: { userId, days: String(days) },
      type: QueryTypes.SELECT,
    }
  );

  const byDay = new Map(
    rows.map((r) => [
      r.day,
      {
        date: r.day,
        durationSeconds: Number(r.duration_seconds),
        eventCount: Number(r.event_count),
      },
    ])
  );

  const series: Array<{
    date: string;
    durationSeconds: number;
    eventCount: number;
  }> = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push(
      byDay.get(key) ?? { date: key, durationSeconds: 0, eventCount: 0 }
    );
  }

  return { days, series };
}

export async function buildStudentDistribution(
  userId: string,
  by: "status" | "category"
) {
  if (by === "status") {
    const rows = await sequelize.query<{ status: string; count: string }>(
      `
      SELECT status, COUNT(*)::int AS count
      FROM lesson_progress
      WHERE user_id = :userId
      GROUP BY status
      `,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    const counts = {
      not_started: 0,
      in_progress: 0,
      completed: 0,
    };
    for (const row of rows) {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = Number(row.count);
      }
    }

    return {
      by: "status" as const,
      segments: [
        { key: "completed", label: "Completed", value: counts.completed },
        { key: "in_progress", label: "In progress", value: counts.in_progress },
        { key: "not_started", label: "Not started", value: counts.not_started },
      ],
    };
  }

  const rows = await sequelize.query<{ category: string; value: string }>(
    `
    SELECT c.category AS category, COUNT(lp.id)::int AS value
    FROM lesson_progress lp
    INNER JOIN lessons l ON l.id = lp.lesson_id
    INNER JOIN courses c ON c.id = l.course_id
    WHERE lp.user_id = :userId AND lp.status = 'completed'
    GROUP BY c.category
    ORDER BY value DESC
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  );

  return {
    by: "category" as const,
    segments: rows.map((r) => ({
      key: r.category,
      label: r.category,
      value: Number(r.value),
    })),
  };
}

export async function getSummary(userId: string, role: string) {
  assertStudentRole(role);
  return buildStudentSummary(userId);
}

export async function getTimeseries(userId: string, role: string, days: number) {
  assertStudentRole(role);
  return buildStudentTimeseries(userId, days);
}

export async function getDistribution(
  userId: string,
  role: string,
  by: "status" | "category"
) {
  assertStudentRole(role);
  return buildStudentDistribution(userId, by);
}
