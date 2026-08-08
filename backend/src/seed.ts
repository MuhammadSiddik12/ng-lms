import bcrypt from "bcryptjs";
import { sequelize } from "./config/database";
import "./models";
import {
  ActivityEvent,
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  MentorStudent,
  User,
} from "./models";

function daysAgo(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export async function seedDatabase(): Promise<void> {
  const existing = await User.findOne({ where: { email: "student@demo.com" } });
  if (existing) {
    console.log("Seed skipped — demo data already present");
    return;
  }

  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  const student = await User.create({
    email: "student@demo.com",
    passwordHash,
    name: "Asha Student",
    role: "student",
  });

  const student2 = await User.create({
    email: "rahul@demo.com",
    passwordHash,
    name: "Rahul Learner",
    role: "student",
  });

  const mentor = await User.create({
    email: "mentor@demo.com",
    passwordHash,
    name: "Priya Mentor",
    role: "mentor",
  });

  await MentorStudent.bulkCreate([
    { mentorId: mentor.id, studentId: student.id },
    { mentorId: mentor.id, studentId: student2.id },
  ]);

  const courses = await Course.bulkCreate([
    {
      title: "TypeScript Fundamentals",
      description: "Types, interfaces, and modern TS patterns for full-stack apps.",
      category: "Programming",
    },
    {
      title: "React for Product Dashboards",
      description: "Build polished dashboards with charts, routing, and forms.",
      category: "Frontend",
    },
    {
      title: "SQL & Data Modeling",
      description: "Relational design, indexes, and aggregation queries.",
      category: "Data",
    },
  ]);

  const [tsCourse, reactCourse, sqlCourse] = courses;

  const tsLessons = await Lesson.bulkCreate([
    {
      courseId: tsCourse.id,
      title: "Why TypeScript?",
      content:
        "TypeScript adds static types to JavaScript so you catch bugs earlier and document intent in code.",
      orderIndex: 1,
      durationMinutes: 12,
    },
    {
      courseId: tsCourse.id,
      title: "Types & Interfaces",
      content:
        "Learn unions, interfaces, and utility types that make APIs safer to consume.",
      orderIndex: 2,
      durationMinutes: 18,
    },
    {
      courseId: tsCourse.id,
      title: "Generics in Practice",
      content:
        "Use generics for reusable helpers like API clients and form validators.",
      orderIndex: 3,
      durationMinutes: 20,
    },
    {
      courseId: tsCourse.id,
      title: "Strict Mode Checklist",
      content:
        "Enable strict compiler options and migrate an existing module safely.",
      orderIndex: 4,
      durationMinutes: 15,
    },
  ]);

  const reactLessons = await Lesson.bulkCreate([
    {
      courseId: reactCourse.id,
      title: "Component Architecture",
      content: "Split UI into layout, feature, and presentational components.",
      orderIndex: 1,
      durationMinutes: 14,
    },
    {
      courseId: reactCourse.id,
      title: "Routing & Auth Guards",
      content: "Protect dashboard routes and redirect unauthenticated users.",
      orderIndex: 2,
      durationMinutes: 16,
    },
    {
      courseId: reactCourse.id,
      title: "Charts with Recharts",
      content: "Render trend lines and donut charts from aggregate API data.",
      orderIndex: 3,
      durationMinutes: 18,
    },
    {
      courseId: reactCourse.id,
      title: "Empty & Loading States",
      content: "Ship product-quality UX with skeletons and useful empty states.",
      orderIndex: 4,
      durationMinutes: 12,
    },
  ]);

  const sqlLessons = await Lesson.bulkCreate([
    {
      courseId: sqlCourse.id,
      title: "Tables & Relationships",
      content: "Model users, courses, lessons, and enrollments with foreign keys.",
      orderIndex: 1,
      durationMinutes: 15,
    },
    {
      courseId: sqlCourse.id,
      title: "Indexes That Matter",
      content: "Add indexes for time-series and progress lookups.",
      orderIndex: 2,
      durationMinutes: 14,
    },
    {
      courseId: sqlCourse.id,
      title: "Aggregations for Dashboards",
      content: "GROUP BY day and compute completion percentages.",
      orderIndex: 3,
      durationMinutes: 20,
    },
  ]);

  await Enrollment.bulkCreate([
    { userId: student.id, courseId: tsCourse.id },
    { userId: student.id, courseId: reactCourse.id },
    { userId: student.id, courseId: sqlCourse.id },
    { userId: student2.id, courseId: tsCourse.id },
    { userId: student2.id, courseId: reactCourse.id },
  ]);

  // Student 1 progress: mostly done with TS, mid React, early SQL
  await LessonProgress.bulkCreate([
    {
      userId: student.id,
      lessonId: tsLessons[0].id,
      status: "completed",
      completedAt: daysAgo(10),
      timeSpentSeconds: 900,
    },
    {
      userId: student.id,
      lessonId: tsLessons[1].id,
      status: "completed",
      completedAt: daysAgo(8),
      timeSpentSeconds: 1200,
    },
    {
      userId: student.id,
      lessonId: tsLessons[2].id,
      status: "completed",
      completedAt: daysAgo(6),
      timeSpentSeconds: 1400,
    },
    {
      userId: student.id,
      lessonId: tsLessons[3].id,
      status: "in_progress",
      timeSpentSeconds: 400,
    },
    {
      userId: student.id,
      lessonId: reactLessons[0].id,
      status: "completed",
      completedAt: daysAgo(5),
      timeSpentSeconds: 1000,
    },
    {
      userId: student.id,
      lessonId: reactLessons[1].id,
      status: "in_progress",
      timeSpentSeconds: 600,
    },
    {
      userId: student.id,
      lessonId: reactLessons[2].id,
      status: "not_started",
      timeSpentSeconds: 0,
    },
    {
      userId: student.id,
      lessonId: reactLessons[3].id,
      status: "not_started",
      timeSpentSeconds: 0,
    },
    {
      userId: student.id,
      lessonId: sqlLessons[0].id,
      status: "completed",
      completedAt: daysAgo(3),
      timeSpentSeconds: 1100,
    },
    {
      userId: student.id,
      lessonId: sqlLessons[1].id,
      status: "not_started",
      timeSpentSeconds: 0,
    },
    {
      userId: student.id,
      lessonId: sqlLessons[2].id,
      status: "not_started",
      timeSpentSeconds: 0,
    },
  ]);

  await LessonProgress.bulkCreate([
    {
      userId: student2.id,
      lessonId: tsLessons[0].id,
      status: "completed",
      completedAt: daysAgo(4),
      timeSpentSeconds: 800,
    },
    {
      userId: student2.id,
      lessonId: tsLessons[1].id,
      status: "in_progress",
      timeSpentSeconds: 300,
    },
    {
      userId: student2.id,
      lessonId: reactLessons[0].id,
      status: "completed",
      completedAt: daysAgo(2),
      timeSpentSeconds: 700,
    },
  ]);

  const activityRows: Array<{
    userId: string;
    courseId: string;
    lessonId: string;
    eventType: "lesson_started" | "lesson_completed" | "time_logged";
    durationSeconds: number;
    createdAt: Date;
  }> = [];

  const pushDaily = (
    userId: string,
    courseId: string,
    lessonId: string,
    day: number,
    seconds: number
  ) => {
    activityRows.push({
      userId,
      courseId,
      lessonId,
      eventType: "time_logged",
      durationSeconds: seconds,
      createdAt: daysAgo(day, 11 + (day % 3)),
    });
  };

  // ~14 days of activity for trend chart
  for (let day = 13; day >= 0; day -= 1) {
    const base = 300 + ((13 - day) % 5) * 120;
    pushDaily(student.id, tsCourse.id, tsLessons[day % 4].id, day, base);
    if (day % 2 === 0) {
      pushDaily(student.id, reactCourse.id, reactLessons[day % 4].id, day, base - 80);
    }
    if (day % 3 === 0) {
      pushDaily(student.id, sqlCourse.id, sqlLessons[day % 3].id, day, base - 40);
    }
  }

  activityRows.push(
    {
      userId: student.id,
      courseId: tsCourse.id,
      lessonId: tsLessons[0].id,
      eventType: "lesson_completed",
      durationSeconds: 0,
      createdAt: daysAgo(10, 15),
    },
    {
      userId: student.id,
      courseId: reactCourse.id,
      lessonId: reactLessons[0].id,
      eventType: "lesson_completed",
      durationSeconds: 0,
      createdAt: daysAgo(5, 16),
    },
    {
      userId: student2.id,
      courseId: tsCourse.id,
      lessonId: tsLessons[0].id,
      eventType: "time_logged",
      durationSeconds: 500,
      createdAt: daysAgo(1, 12),
    }
  );

  await ActivityEvent.bulkCreate(activityRows);

  console.log("Seed complete");
  console.log("  student@demo.com / Demo@12345");
  console.log("  mentor@demo.com  / Demo@12345");
  console.log("  rahul@demo.com   / Demo@12345");
}

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await seedDatabase();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  void run();
}
