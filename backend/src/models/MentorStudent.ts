import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface MentorStudentAttributes {
  id: string;
  mentorId: string;
  studentId: string;
  assignedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type MentorStudentCreation = Optional<
  MentorStudentAttributes,
  "id" | "assignedAt" | "createdAt" | "updatedAt"
>;

export class MentorStudent
  extends Model<MentorStudentAttributes, MentorStudentCreation>
  implements MentorStudentAttributes
{
  declare id: string;
  declare mentorId: string;
  declare studentId: string;
  declare assignedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

MentorStudent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mentorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "mentor_id",
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "student_id",
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "assigned_at",
    },
  },
  {
    sequelize,
    tableName: "mentor_students",
    indexes: [
      { unique: true, fields: ["mentor_id", "student_id"] },
      { fields: ["student_id"] },
    ],
  }
);
