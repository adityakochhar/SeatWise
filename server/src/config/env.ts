import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/seatwise",
  jwtSecret: required("JWT_SECRET"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  holdMinutes: Number(process.env.HOLD_MINUTES ?? 5),
  // Optional. Without these, ticket emails are skipped.
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  mailFrom: process.env.MAIL_FROM ?? "",
};
