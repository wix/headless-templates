// The booking card for a tablet or a phone, shown in the closing block (on a wide screen the Home widget travels there itself).
// Rendered only while the screen is narrower than 1024px, so a wide screen never loads a second set of availability.
import { useEffect, useState } from "react";
import type { ServiceDTO } from "../../lib/services";
import BookingCard from "./BookingCard";

export default function SmallScreenBookingCard({ service, eyebrow }: { service: ServiceDTO; eyebrow?: string }) {
  const [small, setSmall] = useState(() => matchMedia("(max-width: 1023.98px)").matches);
  useEffect(() => {
    const mq = matchMedia("(max-width: 1023.98px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return small ? <BookingCard service={service} eyebrow={eyebrow} /> : null;
}
