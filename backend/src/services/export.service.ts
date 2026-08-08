import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";

function csvEscape(value: string | number | null | undefined) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export async function buildProgressCsv(userId: string, role: string) {
  if (role !== "student") {
    throw new ApiError(403, "CSV export is only available to students");
  }

  const enrollments = await Enrollment.findAll({
    where: { userId },
    include: [{ model: Course, as: "course" }],
  });
  const courseIds = enrollments.map((e) => e.courseId);
  const lessons =
    courseIds.length === 0
      ? []
      : await Lesson.findAll({
          where: { courseId: courseIds },
          order: [
            ["courseId", "ASC"],
            ["orderIndex", "ASC"],
          ],
        });
  const progress = await LessonProgress.findAll({ where: { userId } });
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const courseById = new Map(
    enrollments.map((e) => [e.courseId, e.course])
  );

  const header = [
    "course_title",
    "course_category",
    "lesson_title",
    "lesson_order",
    "status",
    "time_spent_seconds",
    "time_spent_minutes",
    "completed_at",
  ];

  const rows = lessons.map((lesson) => {
    const p = progressByLesson.get(lesson.id);
    const course = courseById.get(lesson.courseId);
    const seconds = p?.timeSpentSeconds ?? 0;
    return [
      csvEscape(course?.title),
      csvEscape(course?.category),
      csvEscape(lesson.title),
      csvEscape(lesson.orderIndex),
      csvEscape(p?.status ?? "not_started"),
      csvEscape(seconds),
      csvEscape(Math.round(seconds / 60)),
      csvEscape(p?.completedAt ? p.completedAt.toISOString() : ""),
    ].join(",");
  });

  return `${header.join(",")}\n${rows.join("\n")}\n`;
}
