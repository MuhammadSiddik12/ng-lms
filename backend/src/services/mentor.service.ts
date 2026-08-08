import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  MentorStudent,
  User,
} from "../models";
import { ApiError } from "../utils/ApiError";
import {
  buildStudentDistribution,
  buildStudentSummary,
  buildStudentTimeseries,
} from "./dashboard.service";

async function assertMentorAccess(mentorId: string, studentId: string) {
  const link = await MentorStudent.findOne({
    where: { mentorId, studentId },
  });
  if (!link) {
    throw new ApiError(403, "This student is not assigned to you");
  }
}

/** Per-course + per-lesson completion details for mentor review */
export async function buildStudentCourseDetails(studentId: string) {
  const enrollments = await Enrollment.findAll({
    where: { userId: studentId },
    include: [
      {
        model: Course,
        as: "course",
        include: [
          {
            model: Lesson,
            as: "lessons",
            separate: true,
            order: [["orderIndex", "ASC"]],
          },
        ],
      },
    ],
  });

  const lessonIds = enrollments.flatMap(
    (e) => e.course?.lessons?.map((l) => l.id) ?? []
  );
  const progressRecords =
    lessonIds.length === 0
      ? []
      : await LessonProgress.findAll({
          where: { userId: studentId, lessonId: lessonIds },
        });
  const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

  return enrollments
    .map((enrollment) => {
      const course = enrollment.course;
      if (!course) return null;

      const lessons = (course.lessons ?? []).map((lesson) => {
        const p = progressMap.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          durationMinutes: lesson.durationMinutes,
          status: p?.status ?? ("not_started" as const),
          timeSpentSeconds: p?.timeSpentSeconds ?? 0,
          completedAt: p?.completedAt ?? null,
        };
      });

      const completedLessons = lessons.filter((l) => l.status === "completed").length;
      const inProgressLessons = lessons.filter((l) => l.status === "in_progress").length;
      const notStartedLessons = lessons.filter((l) => l.status === "not_started").length;
      const timeSpentSeconds = lessons.reduce((sum, l) => sum + l.timeSpentSeconds, 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        enrolledAt: enrollment.enrolledAt,
        totalLessons: lessons.length,
        completedLessons,
        inProgressLessons,
        notStartedLessons,
        timeSpentSeconds,
        progressPercent:
          lessons.length === 0
            ? 0
            : Math.round((completedLessons / lessons.length) * 100),
        lessons,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function listMentorStudents(mentorId: string, role: string) {
  if (role !== "mentor") {
    throw new ApiError(403, "Mentor access required");
  }

  const assignments = await MentorStudent.findAll({
    where: { mentorId },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "name", "email", "role", "createdAt"],
      },
    ],
    order: [["assignedAt", "ASC"]],
  });

  const students = await Promise.all(
    assignments.map(async (assignment) => {
      const student = assignment.student;
      if (!student) {
        throw new ApiError(500, "Assignment missing student");
      }
      const summary = await buildStudentSummary(student.id);
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        assignedAt: assignment.assignedAt,
        completedLessons: summary.completedLessons,
        totalLessons: summary.totalLessons,
        overallProgressPercent: summary.overallProgressPercent,
        timeSpentSeconds: summary.timeSpentSeconds,
        enrolledCourses: summary.enrolledCourses,
        inProgressLessons: summary.inProgressLessons,
      };
    })
  );

  return { students };
}

export async function getMentorStudentDashboard(
  mentorId: string,
  role: string,
  studentId: string,
  days = 14
) {
  if (role !== "mentor") {
    throw new ApiError(403, "Mentor access required");
  }

  await assertMentorAccess(mentorId, studentId);

  const student = await User.findByPk(studentId, {
    attributes: ["id", "name", "email", "role"],
  });
  if (!student || student.role !== "student") {
    throw new ApiError(404, "Student not found");
  }

  const [summary, timeseries, distribution, courseDetails] = await Promise.all([
    buildStudentSummary(studentId),
    buildStudentTimeseries(studentId, days),
    buildStudentDistribution(studentId, "status"),
    buildStudentCourseDetails(studentId),
  ]);

  return {
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
    summary,
    timeseries,
    distribution,
    courseDetails,
  };
}
