import { z } from "zod";

export const holdSeatsSchema = z.object({
  showId: z.string().min(1, "Show is required"),
  seatIds: z
    .array(z.string().min(1))
    .min(1, "Pick at least one seat")
    .max(6, "You can book up to 6 seats at a time"),
});

export type HoldSeatsInput = z.infer<typeof holdSeatsSchema>;
