import { MentorStudent, User } from "../models";
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

  const [summary, timeseries, distribution] = await Promise.all([
    buildStudentSummary(studentId),
    buildStudentTimeseries(studentId, days),
    buildStudentDistribution(studentId, "status"),
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
  };
}
