import { createApp } from "./app";
import { connectDatabase, sequelize } from "./config/database";
import { env } from "./config/env";
import "./models";
import { seedDatabase } from "./seed";

async function bootstrap() {
  try {
    await connectDatabase();

    if (env.DB_SYNC) {
      await sequelize.sync({ alter: true });
      console.log("Database schema synced");
    }

    if (env.DB_SEED) {
      await seedDatabase();
    }

    const app = createApp();
    app.listen(env.PORT, () => {
      console.log(`API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void bootstrap();
