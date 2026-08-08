export type UserRole = "student" | "mentor";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ path?: string; message: string }>;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface CourseProgressSummary {
  id: string;
  title: string;
  category: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  timeSpentSeconds: number;
}

export interface DashboardSummary {
  completedLessons: number;
  inProgressLessons: number;
  totalLessons: number;
  timeSpentSeconds: number;
  timeSpentHours: number;
  enrolledCourses: number;
  overallProgressPercent: number;
  courses: CourseProgressSummary[];
}

export interface TimeseriesPoint {
  date: string;
  durationSeconds: number;
  eventCount: number;
}

export interface DashboardTimeseries {
  days: number;
  series: TimeseriesPoint[];
}

export interface DistributionSegment {
  key: string;
  label: string;
  value: number;
}

export interface DashboardDistribution {
  by: "status" | "category";
  segments: DistributionSegment[];
}

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  enrolledAt?: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface CourseLessonItem {
  id: string;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  status: ProgressStatus;
  timeSpentSeconds: number;
  completedAt: string | null;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lessons: CourseLessonItem[];
}

export interface LessonDetail {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  durationMinutes: number;
  course: {
    id: string;
    title: string;
    category: string;
  } | null;
  progress: {
    status: ProgressStatus;
    timeSpentSeconds: number;
    completedAt: string | null;
  };
}

export interface LessonProgressUpdate {
  lessonId: string;
  status: ProgressStatus;
  timeSpentSeconds: number;
  completedAt: string | null;
}

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

export interface MentorStudentSummary {
  id: string;
  name: string;
  email: string;
  assignedAt: string;
  completedLessons: number;
  totalLessons: number;
  overallProgressPercent: number;
  timeSpentSeconds: number;
  enrolledCourses: number;
  inProgressLessons: number;
}

export interface MentorCourseLessonDetail {
  id: string;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  status: ProgressStatus;
  timeSpentSeconds: number;
  completedAt: string | null;
}

export interface MentorCourseDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  notStartedLessons: number;
  timeSpentSeconds: number;
  progressPercent: number;
  lessons: MentorCourseLessonDetail[];
}

export interface MentorStudentDashboard {
  student: {
    id: string;
    name: string;
    email: string;
  };
  summary: DashboardSummary;
  timeseries: DashboardTimeseries;
  distribution: DashboardDistribution;
  courseDetails: MentorCourseDetail[];
}
