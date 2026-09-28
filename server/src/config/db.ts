import mongoose from "mongoose";
import { logger } from "../lib/logger";

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
  logger.info("Connected to MongoDB");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
