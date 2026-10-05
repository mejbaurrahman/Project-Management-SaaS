import { createClient } from "redis";

import config from "../config/index.js";

export const redisClient = createClient({
  username: config.redis_user,

  password: config.redis_password,

  socket: {
    host: config.redis_host,
    port: config.redis_port,
  },
});

redisClient.on("error", (error) => {
  console.error("❌ Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("🔄 Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis client ready");
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const result = await redisClient.ping();

  console.log("✅ Redis connected:", result);
};
