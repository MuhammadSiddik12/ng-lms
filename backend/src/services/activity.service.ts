import { sequelize } from "../config/database";
import {
  ActivityEvent,
  Enrollment,
  Lesson,
  LessonProgress,
} from "../models";
import { ApiError } from "../utils/ApiError";
import type { createActivitySchema } from "../validations/activity.validation";
import type { z } from "zod";

type CreateActivityInput = z.infer<typeof createActivitySchema>;

export async function createActivity(
  userId: string,
  role: string,
  input: CreateActivityInput
) {
  if (role !== "student") {
    throw new ApiError(403, "Only students can log activity events");
  }

  let courseId = input.courseId ?? null;
  let lessonId = input.lessonId ?? null;

  if (lessonId) {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      throw new ApiError(404, "Lesson not found");
    }
    courseId = courseId ?? lesson.courseId;

    const enrolled = await Enrollment.findOne({
      where: { userId, courseId: lesson.courseId },
    });
    if (!enrolled) {
      throw new ApiError(403, "You are not enrolled in this course");
    }
  } else if (courseId) {
    const enrolled = await Enrollment.findOne({ where: { userId, courseId } });
    if (!enrolled) {
      throw new ApiError(403, "You are not enrolled in this course");
    }
  }

  return sequelize.transaction(async (transaction) => {
    const event = await ActivityEvent.create(
      {
        userId,
        courseId,
        lessonId,
        eventType: input.eventType,
        durationSeconds: input.durationSeconds,
        metadata: input.metadata ?? null,
      },
      { transaction }
    );

    if (lessonId && (input.durationSeconds > 0 || input.eventType !== "quiz_attempt")) {
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

      if (input.durationSeconds > 0) {
        progress.timeSpentSeconds += input.durationSeconds;
      }

      if (input.eventType === "lesson_started" && progress.status === "not_started") {
        progress.status = "in_progress";
      }

      if (input.eventType === "lesson_completed") {
        progress.status = "completed";
        progress.completedAt = new Date();
      } else if (
        progress.status === "not_started" &&
        input.eventType === "time_logged"
      ) {
        progress.status = "in_progress";
      }

      await progress.save({ transaction });
    }

    return {
      id: event.id,
      eventType: event.eventType,
      courseId: event.courseId,
      lessonId: event.lessonId,
      durationSeconds: event.durationSeconds,
      createdAt: event.createdAt,
    };
  });
}
