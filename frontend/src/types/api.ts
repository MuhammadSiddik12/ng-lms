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
