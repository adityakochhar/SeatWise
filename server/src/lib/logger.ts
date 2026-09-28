const quiet = process.env.NODE_ENV === "test";

function line(level: string, message: string, extra?: unknown): void {
  if (quiet) return;
  const stamp = new Date().toISOString();
  if (extra === undefined) {
    console.log(`${stamp} ${level} ${message}`);
  } else {
    console.log(`${stamp} ${level} ${message}`, extra);
  }
}

export const logger = {
  info: (message: string, extra?: unknown) => line("INFO", message, extra),
  warn: (message: string, extra?: unknown) => line("WARN", message, extra),
  error: (message: string, extra?: unknown) => line("ERROR", message, extra),
};
