import http from "node:http";
import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { startHoldExpiryJob } from "./jobs/expire-holds";
import { logger } from "./lib/logger";
import { initRealtime } from "./realtime/socket";

async function main(): Promise<void> {
  await connectDatabase(env.mongoUri);

  const app = createApp();
  const server = http.createServer(app);
  initRealtime(server, env.clientOrigin);
  startHoldExpiryJob();

  server.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  logger.error("Failed to start", err);
  process.exit(1);
});
