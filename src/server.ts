import app from "./app.js";
import config from "./app/config/index.js";
import { prisma } from "./app/lib/prisma.js";

const main = async () => {
  try {
    // Connect Prisma to PostgreSQL
    await prisma.$connect();

    // Run a simple query to confirm the database is reachable
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ PostgreSQL database connected successfully");

    app.listen(config.port, () => {
      console.log(`🚀 TaskFlow server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:", error);

    process.exit(1);
  }
};

main();
