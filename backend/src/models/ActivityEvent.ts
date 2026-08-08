import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type ActivityEventType =
  | "lesson_started"
  | "lesson_completed"
  | "time_logged"
  | "quiz_attempt";

export interface ActivityEventAttributes {
  id: string;
  userId: string;
  courseId: string | null;
  lessonId: string | null;
  eventType: ActivityEventType;
  durationSeconds: number;
  metadata: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ActivityEventCreation = Optional<
  ActivityEventAttributes,
  | "id"
  | "courseId"
  | "lessonId"
  | "durationSeconds"
  | "metadata"
  | "createdAt"
  | "updatedAt"
>;

export class ActivityEvent
  extends Model<ActivityEventAttributes, ActivityEventCreation>
  implements ActivityEventAttributes
{
  declare id: string;
  declare userId: string;
  declare courseId: string | null;
  declare lessonId: string | null;
  declare eventType: ActivityEventType;
  declare durationSeconds: number;
  declare metadata: Record<string, unknown> | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ActivityEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "course_id",
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "lesson_id",
    },
    eventType: {
      type: DataTypes.ENUM(
        "lesson_started",
        "lesson_completed",
        "time_logged",
        "quiz_attempt"
      ),
      allowNull: false,
      field: "event_type",
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "duration_seconds",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "activity_events",
    updatedAt: false,
    indexes: [
      { fields: ["user_id", "created_at"] },
      { fields: ["course_id", "created_at"] },
      { fields: ["event_type"] },
    ],
  }
);
