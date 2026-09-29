import { env } from "../config/env";
import { logger } from "./logger";

interface Email {
  to: string;
  subject: string;
  text: string;
}

// Sends an email through Brevo's HTTP API. We use HTTP rather than SMTP
// because Render's free plan blocks the SMTP ports.
export async function sendEmail(email: Email): Promise<void> {
  if (!env.brevoApiKey || !env.mailFrom) {
    logger.info(`Email is not set up, skipping "${email.subject}"`);
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.brevoApiKey, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: "SeatWise", email: env.mailFrom },
      to: [{ email: email.to }],
      subject: email.subject,
      textContent: email.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo returned ${response.status}: ${await response.text()}`);
  }
}
