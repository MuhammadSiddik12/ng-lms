import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import type { Course } from "./Course";

export interface LessonAttributes {
  id: string;
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  durationMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type LessonCreation = Optional<LessonAttributes, "id" | "createdAt" | "updatedAt">;

export class Lesson
  extends Model<LessonAttributes, LessonCreation>
  implements LessonAttributes
{
  declare id: string;
  declare courseId: string;
  declare title: string;
  declare content: string;
  declare orderIndex: number;
  declare durationMinutes: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare course?: Course;
}

Lesson.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_id",
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "order_index",
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      field: "duration_minutes",
    },
  },
  {
    sequelize,
    tableName: "lessons",
    indexes: [
      { fields: ["course_id"] },
      { unique: true, fields: ["course_id", "order_index"] },
    ],
  }
);
