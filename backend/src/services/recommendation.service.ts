import {
  ActivityEvent,
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  reason: string;
  actionLabel: string;
  href: string;
  courseId?: string;
  lessonId?: string;
}

export async function getRecommendations(userId: string, role: string) {
  if (role !== "student") {
    throw new ApiError(403, "Recommendations are only available to students");
  }

  const recommendations: Recommendation[] = [];

  const enrollments = await Enrollment.findAll({
    where: { userId },
    include: [{ model: Course, as: "course" }],
  });

  if (enrollments.length === 0) {
    return {
      recommendations: [
        {
          id: "no-enrollment",
          priority: "medium" as const,
          title: "Get enrolled in a course",
          reason: "You are not enrolled in any courses yet.",
          actionLabel: "View courses",
          href: "/courses",
        },
      ],
    };
  }

  const courseIds = enrollments.map((e) => e.courseId);
  const lessons = await Lesson.findAll({
    where: { courseId: courseIds },
    order: [
      ["courseId", "ASC"],
      ["orderIndex", "ASC"],
    ],
  });
  const progress = await LessonProgress.findAll({ where: { userId } });
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  const recentActivity = await ActivityEvent.findOne({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  const daysSinceActivity = recentActivity
    ? Math.floor(
        (Date.now() - new Date(recentActivity.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;

  if (daysSinceActivity >= 3) {
    const resume =
      lessons.find((l) => progressByLesson.get(l.id)?.status === "in_progress") ??
      lessons.find((l) => (progressByLesson.get(l.id)?.status ?? "not_started") !== "completed");

    recommendations.push({
      id: "reactivate",
      priority: "high",
      title:
        daysSinceActivity >= 999
          ? "Start your first study session"
          : `You’re back after ${daysSinceActivity} quiet days`,
      reason:
        "A short session today keeps your streak and momentum alive.",
      actionLabel: resume ? "Resume learning" : "Open courses",
      href: resume ? `/lessons/${resume.id}` : "/courses",
      lessonId: resume?.id,
      courseId: resume?.courseId,
    });
  }

  const inProgress = lessons.filter(
    (l) => progressByLesson.get(l.id)?.status === "in_progress"
  );
  for (const lesson of inProgress.slice(0, 2)) {
    const course = enrollments.find((e) => e.courseId === lesson.courseId)?.course;
    recommendations.push({
      id: `continue-${lesson.id}`,
      priority: "high",
      title: `Continue: ${lesson.title}`,
      reason: `Pick up where you left off in ${course?.title ?? "your course"}.`,
      actionLabel: "Open lesson",
      href: `/lessons/${lesson.id}`,
      lessonId: lesson.id,
      courseId: lesson.courseId,
    });
  }

  // Lowest progress enrolled course → next unfinished lesson
  const courseStats = enrollments.map((enrollment) => {
    const courseLessons = lessons.filter((l) => l.courseId === enrollment.courseId);
    const completed = courseLessons.filter(
      (l) => progressByLesson.get(l.id)?.status === "completed"
    ).length;
    const nextLesson = courseLessons.find(
      (l) => (progressByLesson.get(l.id)?.status ?? "not_started") !== "completed"
    );
    const percent =
      courseLessons.length === 0
        ? 100
        : Math.round((completed / courseLessons.length) * 100);
    return { enrollment, percent, nextLesson, total: courseLessons.length };
  });

  const lowest = [...courseStats]
    .filter((c) => c.nextLesson)
    .sort((a, b) => a.percent - b.percent)[0];

  if (lowest?.nextLesson) {
    const already = recommendations.some(
      (r) => r.lessonId === lowest.nextLesson!.id
    );
    if (!already) {
      recommendations.push({
        id: `boost-${lowest.enrollment.courseId}`,
        priority: "medium",
        title: `Boost progress in ${lowest.enrollment.course?.title ?? "a course"}`,
        reason: `This course is at ${lowest.percent}% — next up is “${lowest.nextLesson.title}”.`,
        actionLabel: "Start next lesson",
        href: `/lessons/${lowest.nextLesson.id}`,
        lessonId: lowest.nextLesson.id,
        courseId: lowest.enrollment.courseId,
      });
    }
  }

  // Suggest a short lesson (smallest duration among not started)
  const shortLesson = lessons
    .filter((l) => (progressByLesson.get(l.id)?.status ?? "not_started") === "not_started")
    .sort((a, b) => a.durationMinutes - b.durationMinutes)[0];

  if (shortLesson) {
    const already = recommendations.some((r) => r.lessonId === shortLesson.id);
    if (!already) {
      recommendations.push({
        id: `quick-${shortLesson.id}`,
        priority: "low",
        title: `Quick win: ${shortLesson.title}`,
        reason: `Only ~${shortLesson.durationMinutes} minutes — a great short session.`,
        actionLabel: "Start quick lesson",
        href: `/lessons/${shortLesson.id}`,
        lessonId: shortLesson.id,
        courseId: shortLesson.courseId,
      });
    }
  }

  const completedCount = progress.filter((p) => p.status === "completed").length;
  if (completedCount >= 3) {
    const nextOpen = lessons.find(
      (l) => (progressByLesson.get(l.id)?.status ?? "not_started") !== "completed"
    );
    recommendations.push({
      id: "celebrate",
      priority: "low",
      title: `You’ve completed ${completedCount} lessons`,
      reason: "Keep the streak going — consistency beats intensity.",
      actionLabel: nextOpen ? "Continue next lesson" : "Browse courses",
      href: nextOpen ? `/lessons/${nextOpen.id}` : "/courses",
      lessonId: nextOpen?.id,
      courseId: nextOpen?.courseId,
    });
  }

  // Deduplicate by id, cap at 5
  const unique = Array.from(
    new Map(recommendations.map((r) => [r.id, r])).values()
  ).slice(0, 5);

  if (unique.length === 0) {
    unique.push({
      id: "all-caught-up",
      priority: "low",
      title: "You’re all caught up",
      reason: "No urgent next steps — explore another course when ready.",
      actionLabel: "Browse courses",
      href: "/courses",
    });
  }

  return { recommendations: unique, generatedAt: new Date().toISOString() };
}
