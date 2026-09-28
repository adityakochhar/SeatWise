import { logger } from "../lib/logger";
import { expireStaleHolds } from "../modules/bookings/booking.service";

const sweepEveryMs = 30_000;

export function startHoldExpiryJob(): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      const count = await expireStaleHolds();
      if (count > 0) {
        logger.info(`Released ${count} expired hold${count === 1 ? "" : "s"}`);
      }
    } catch (err) {
      logger.error("Hold expiry job failed", err);
    }
  }, sweepEveryMs);
}
