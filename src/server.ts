import app from "./app.js";
import config from "./app/config/index.js";
import { prisma } from "./app/lib/prisma.js";
import { connectRedis } from "./app/lib/redis.js";
import { seedTesterAdmin } from "./app/utils/seed.js";

const main = async () => {
  try {
    await prisma.$connect();
    await connectRedis();
    await seedTesterAdmin();

    await prisma.$queryRaw`SELECT 1`;

    console.log("PostgreSQL database connected successfully");
    console.log("NODE ENV:", config.node_env);

    app.listen(config.port, () => {
      console.log(`PMS server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);

    process.exit(1);
  }
};

main();
