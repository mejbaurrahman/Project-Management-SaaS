import app from "./app.js";
import config from "./app/config/index.js";
import { prisma } from "./app/lib/prisma.js";
import { connectRedis } from "./app/lib/redis.js";
import { seedTesterAdmin } from "./app/utils/seed.js";

let initialized = false;

export const initializeApp = async () => {
  if (initialized) return;

  await prisma.$connect();
  await connectRedis();
  await seedTesterAdmin();

  await prisma.$queryRaw`SELECT 1`;

  initialized = true;

  console.log("PostgreSQL database connected successfully");

  console.log("NODE ENV:", config.node_env);
};

const main = async () => {
  try {
    await initializeApp();

    app.listen(config.port, () => {
      console.log(`PMS server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start PMS server:", error);

    process.exit(1);
  }
};

if (process.env.VERCEL !== "1") {
  main();
}
