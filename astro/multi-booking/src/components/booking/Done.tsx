// After Book now. This page can only say what the visitor's own calls returned, because the booking cannot be read back
// without the elevated anonymous-token call. Two honest cases, and a third for a visit
// with nothing to show. It never says "confirmed".
import { useEffect, useState } from "react";
import { useAppointments, clear } from "../../lib/cart";
import { loadPlaced, clearDetails, type Placed } from "../../lib/drafts";
import { formatDuration, formatPrice } from "../../lib/services";
import { whenLabel } from "../../lib/dates";

export default function Done() {
  const from = typeof location === "undefined" ? "" : new URLSearchParams(location.search).get("from");
  const appts = useAppointments();
  const [placed, setPlaced] = useState<Placed | null>(null);
  useEffect(() => { setPlaced(loadPlaced()); }, []);

  if (from === "order" && placed) {
    return (
      <div>
        <h1 className="mt-4 text-h2">We have received your booking</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          Your {placed.appointments.length === 1 ? "appointment was" : "appointments were"} placed{placed.email ? <> and an email will follow to <strong className="text-foreground">{placed.email}</strong></> : ""}.
          This page cannot show whether the business has confirmed {placed.appointments.length === 1 ? "it" : "them"} yet.
        </p>
        <ul className="mt-8 book-card">
          {placed.appointments.map((a) => (
            <li key={a.id} className="flex justify-between gap-4 border-b border-border px-4 py-4 last:border-b-0">
              <div><p className="font-medium">{a.serviceName}</p><p className="text-sm text-muted-foreground">{whenLabel(a.startDate)} · {formatDuration(a.minutes)} · {a.staff.name}</p></div>
              <p className="shrink-0 font-medium">{formatPrice(a.price)}</p>
            </li>
          ))}
        </ul>
        <a href="/" className="btn btn-primary mt-10">Back to Home</a>
      </div>
    );
  }
  if (from === "checkout") {
    return (
      <div>
        <h1 className="mt-4 text-h2">You are back from checkout</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          This page cannot tell whether your payment went through. If you completed it, an email will follow. If you left before paying, your appointments are not booked yet.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {appts.length > 0 && <a href="/book/confirm" className="btn btn-primary">Review my appointments</a>}
          <a href="/" className={`btn ${appts.length > 0 ? "btn-secondary" : "btn-primary"}`}>Back to Home</a>
        </div>
        {appts.length > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">Already paid? <button type="button" className="link-btn" onClick={() => { clear(); clearDetails(); }}>Clear my list</button></p>
        )}
      </div>
    );
  }
  return (
    <div>
      <h1 className="mt-4 text-h2">Nothing to show here</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">There is no booking in this session.</p>
      <a href="/book" className="btn btn-primary mt-10">Select Service</a>
    </div>
  );
}
