import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import type { Lesson } from "./Lesson";

export interface CourseAttributes {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CourseCreation = Optional<
  CourseAttributes,
  "id" | "description" | "createdAt" | "updatedAt"
>;

export class Course
  extends Model<CourseAttributes, CourseCreation>
  implements CourseAttributes
{
  declare id: string;
  declare title: string;
  declare description: string | null;
  declare category: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare lessons?: Lesson[];
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "General",
    },
  },
  {
    sequelize,
    tableName: "courses",
    indexes: [{ fields: ["category"] }],
  }
);
