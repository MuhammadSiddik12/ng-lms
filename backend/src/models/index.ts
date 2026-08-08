import { User } from "./User";
import { Course } from "./Course";
import { Lesson } from "./Lesson";
import { Enrollment } from "./Enrollment";
import { LessonProgress } from "./LessonProgress";
import { ActivityEvent } from "./ActivityEvent";
import { MentorStudent } from "./MentorStudent";

Course.hasMany(Lesson, { foreignKey: "courseId", as: "lessons", onDelete: "CASCADE" });
Lesson.belongsTo(Course, { foreignKey: "courseId", as: "course" });

User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: "userId",
  otherKey: "courseId",
  as: "courses",
});
Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: "courseId",
  otherKey: "userId",
  as: "students",
});
User.hasMany(Enrollment, { foreignKey: "userId", as: "enrollments" });
Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });
Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

User.hasMany(LessonProgress, { foreignKey: "userId", as: "lessonProgress" });
LessonProgress.belongsTo(User, { foreignKey: "userId", as: "user" });
Lesson.hasMany(LessonProgress, { foreignKey: "lessonId", as: "progressRecords" });
LessonProgress.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

User.hasMany(ActivityEvent, { foreignKey: "userId", as: "activities" });
ActivityEvent.belongsTo(User, { foreignKey: "userId", as: "user" });
Course.hasMany(ActivityEvent, { foreignKey: "courseId", as: "activities" });
ActivityEvent.belongsTo(Course, { foreignKey: "courseId", as: "course" });
Lesson.hasMany(ActivityEvent, { foreignKey: "lessonId", as: "activities" });
ActivityEvent.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

User.belongsToMany(User, {
  through: MentorStudent,
  as: "students",
  foreignKey: "mentorId",
  otherKey: "studentId",
});
User.belongsToMany(User, {
  through: MentorStudent,
  as: "mentors",
  foreignKey: "studentId",
  otherKey: "mentorId",
});
MentorStudent.belongsTo(User, { foreignKey: "mentorId", as: "mentor" });
MentorStudent.belongsTo(User, { foreignKey: "studentId", as: "student" });

export {
  User,
  Course,
  Lesson,
  Enrollment,
  LessonProgress,
  ActivityEvent,
  MentorStudent,
};
