import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";

export async function listCoursesForUser(userId: string, role: string) {
  if (role === "mentor") {
    const courses = await Course.findAll({
      order: [["title", "ASC"]],
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id"],
        },
      ],
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      totalLessons: course.lessons?.length ?? 0,
    }));
  }

  const enrollments = await Enrollment.findAll({
    where: { userId },
    include: [
      {
        model: Course,
        as: "course",
        include: [{ model: Lesson, as: "lessons", attributes: ["id"] }],
      },
    ],
  });

  const lessonIds = enrollments.flatMap(
    (e) => e.course?.lessons?.map((l) => l.id) ?? []
  );
  const progress =
    lessonIds.length === 0
      ? []
      : await LessonProgress.findAll({
          where: { userId, lessonId: lessonIds },
        });
  const completedSet = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lessonId)
  );

  return enrollments
    .map((enrollment) => {
      const course = enrollment.course;
      if (!course) {
        throw new ApiError(500, "Enrollment missing course");
      }
      const totalLessons = course.lessons?.length ?? 0;
      const completedLessons =
        course.lessons?.filter((l) => completedSet.has(l.id)).length ?? 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        enrolledAt: enrollment.enrolledAt,
        totalLessons,
        completedLessons,
        progressPercent:
          totalLessons === 0
            ? 0
            : Math.round((completedLessons / totalLessons) * 100),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getCourseDetail(userId: string, role: string, courseId: string) {
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Lesson,
        as: "lessons",
        separate: true,
        order: [["orderIndex", "ASC"]],
      },
    ],
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (role === "student") {
    const enrolled = await Enrollment.findOne({ where: { userId, courseId } });
    if (!enrolled) {
      throw new ApiError(403, "You are not enrolled in this course");
    }
  }

  const lessonIds = course.lessons?.map((l) => l.id) ?? [];
  const progress =
    role === "student" && lessonIds.length > 0
      ? await LessonProgress.findAll({ where: { userId, lessonId: lessonIds } })
      : [];
  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

  const lessons = (course.lessons ?? []).map((lesson) => {
    const p = progressMap.get(lesson.id);
    return {
      id: lesson.id,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      durationMinutes: lesson.durationMinutes,
      status: p?.status ?? "not_started",
      timeSpentSeconds: p?.timeSpentSeconds ?? 0,
      completedAt: p?.completedAt ?? null,
    };
  });

  const completedLessons = lessons.filter((l) => l.status === "completed").length;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    totalLessons: lessons.length,
    completedLessons,
    progressPercent:
      lessons.length === 0
        ? 0
        : Math.round((completedLessons / lessons.length) * 100),
    lessons,
  };
}
