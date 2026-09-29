import { sendEmail } from "../../lib/mailer";
import { UserModel } from "../users/user.model";
import type { BookingView } from "./booking.service";

const showTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short" });

export async function sendTicketEmail(userId: string, booking: BookingView): Promise<void> {
  const user = await UserModel.findById(userId);
  if (!user) return;

  const { show } = booking;
  const text = [
    `Hi ${user.name},`,
    "",
    "Your booking is confirmed. Show this ticket code at the counter.",
    "",
    `Ticket code: ${booking.code}`,
    "",
    `Movie:  ${show.movie.title}`,
    `When:   ${showTime.format(show.startsAt)}`,
    `Where:  ${show.cinema.name}, ${show.cinema.city} (${show.screen.name})`,
    `Seats:  ${booking.seatLabels.join(", ")}`,
    `Paid:   Rs. ${booking.amount}`,
    "",
    "Enjoy the show!",
    "SeatWise",
  ].join("\n");

  await sendEmail({ to: user.email, subject: `Your SeatWise ticket for ${show.movie.title}`, text });
}
