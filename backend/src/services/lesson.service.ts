import { sequelize } from "../config/database";
import {
  ActivityEvent,
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";
import type { updateProgressSchema } from "../validations/activity.validation";
import type { z } from "zod";

type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

async function ensureLessonAccess(userId: string, role: string, lesson: Lesson) {
  if (role === "mentor") return;
  const enrolled = await Enrollment.findOne({
    where: { userId, courseId: lesson.courseId },
  });
  if (!enrolled) {
    throw new ApiError(403, "You are not enrolled in this course");
  }
}

export async function getLessonDetail(userId: string, role: string, lessonId: string) {
  const lesson = await Lesson.findByPk(lessonId, {
    include: [{ model: Course, as: "course" }],
  });
  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  await ensureLessonAccess(userId, role, lesson);

  const progress =
    role === "student"
      ? await LessonProgress.findOne({ where: { userId, lessonId } })
      : null;

  return {
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    orderIndex: lesson.orderIndex,
    durationMinutes: lesson.durationMinutes,
    course: lesson.course
      ? {
          id: lesson.course.id,
          title: lesson.course.title,
          category: lesson.course.category,
        }
      : null,
    progress: {
      status: progress?.status ?? "not_started",
      timeSpentSeconds: progress?.timeSpentSeconds ?? 0,
      completedAt: progress?.completedAt ?? null,
    },
  };
}

export async function updateLessonProgress(
  userId: string,
  role: string,
  lessonId: string,
  input: UpdateProgressInput
) {
  if (role !== "student") {
    throw new ApiError(403, "Only students can update lesson progress");
  }

  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }
  await ensureLessonAccess(userId, role, lesson);

  return sequelize.transaction(async (transaction) => {
    let progress = await LessonProgress.findOne({
      where: { userId, lessonId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!progress) {
      progress = await LessonProgress.create(
        {
          userId,
          lessonId,
          status: "not_started",
          timeSpentSeconds: 0,
        },
        { transaction }
      );
    }

    const previousStatus = progress.status;
    let nextStatus = input.status ?? progress.status;

    if (input.incrementSeconds) {
      progress.timeSpentSeconds += input.incrementSeconds;
      if (nextStatus === "not_started") {
        nextStatus = "in_progress";
      }
    }

    if (typeof input.timeSpentSeconds === "number") {
      progress.timeSpentSeconds = input.timeSpentSeconds;
    }

    if (nextStatus === "completed" && previousStatus !== "completed") {
      progress.completedAt = new Date();
      await ActivityEvent.create(
        {
          userId,
          courseId: lesson.courseId,
          lessonId,
          eventType: "lesson_completed",
          durationSeconds: 0,
        },
        { transaction }
      );
    }

    if (nextStatus === "in_progress" && previousStatus === "not_started") {
      await ActivityEvent.create(
        {
          userId,
          courseId: lesson.courseId,
          lessonId,
          eventType: "lesson_started",
          durationSeconds: 0,
        },
        { transaction }
      );
    }

    if (nextStatus !== "completed") {
      progress.completedAt = null;
    }

    progress.status = nextStatus;
    await progress.save({ transaction });

    return {
      lessonId,
      status: progress.status,
      timeSpentSeconds: progress.timeSpentSeconds,
      completedAt: progress.completedAt,
    };
  });
}
