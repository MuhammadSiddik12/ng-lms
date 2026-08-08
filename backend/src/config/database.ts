import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "postgres",
  logging: env.NODE_ENV === "development" ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
  console.log("PostgreSQL connected");
}
