import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import type { Course } from "./Course";

export interface EnrollmentAttributes {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type EnrollmentCreation = Optional<
  EnrollmentAttributes,
  "id" | "enrolledAt" | "createdAt" | "updatedAt"
>;

export class Enrollment
  extends Model<EnrollmentAttributes, EnrollmentCreation>
  implements EnrollmentAttributes
{
  declare id: string;
  declare userId: string;
  declare courseId: string;
  declare enrolledAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare course?: Course;
}

Enrollment.init(
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
      allowNull: false,
      field: "course_id",
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "enrolled_at",
    },
  },
  {
    sequelize,
    tableName: "enrollments",
    indexes: [
      { unique: true, fields: ["user_id", "course_id"] },
      { fields: ["course_id"] },
    ],
  }
);
