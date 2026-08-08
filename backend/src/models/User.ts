import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type UserRole = "student" | "mentor";

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreation = Optional<UserAttributes, "id" | "createdAt" | "updatedAt">;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare role: UserRole;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "mentor"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    indexes: [{ fields: ["role"] }],
  }
);
