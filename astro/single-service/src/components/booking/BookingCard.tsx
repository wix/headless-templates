// A stand-alone booking card: the Home widget's card (BookingPanel) on a page of its own, without the scroll animation.
import type { ServiceDTO } from "../../lib/services";
import type { Appointment } from "../../lib/selection";
import { BookingPanel, useWeekAvailability } from "./BookingPanel";

export default function BookingCard({ service, eyebrow, from, fallbackHref }: { service: ServiceDTO; eyebrow?: string; from?: Appointment["from"]; fallbackHref?: string }) {
  const av = useWeekAvailability(service);
  return (
    <div className="hw-card" role="group" aria-label={`Book ${service.name}`}>
      <BookingPanel av={av} service={service} eyebrow={eyebrow} from={from} fallbackHref={fallbackHref} />
    </div>
  );
}
