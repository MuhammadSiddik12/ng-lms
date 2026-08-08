import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgressAttributes {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  completedAt: Date | null;
  timeSpentSeconds: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type LessonProgressCreation = Optional<
  LessonProgressAttributes,
  "id" | "status" | "completedAt" | "timeSpentSeconds" | "createdAt" | "updatedAt"
>;

export class LessonProgress
  extends Model<LessonProgressAttributes, LessonProgressCreation>
  implements LessonProgressAttributes
{
  declare id: string;
  declare userId: string;
  declare lessonId: string;
  declare status: ProgressStatus;
  declare completedAt: Date | null;
  declare timeSpentSeconds: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

LessonProgress.init(
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
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "lesson_id",
    },
    status: {
      type: DataTypes.ENUM("not_started", "in_progress", "completed"),
      allowNull: false,
      defaultValue: "not_started",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
    timeSpentSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "time_spent_seconds",
    },
  },
  {
    sequelize,
    tableName: "lesson_progress",
    indexes: [
      { unique: true, fields: ["user_id", "lesson_id"] },
      { fields: ["user_id", "status"] },
    ],
  }
);
