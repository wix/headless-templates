// After Book now. This page can only say what the visitor's own calls returned, because the booking cannot be read back without
// the elevated anonymous-token call (BOOKINGS_EVIDENCE.md, probe 1). Two honest cases, and a third for a visit with nothing to show.
// It never says "confirmed".
import { useEffect, useState } from "react";
import { useSelection, clearSelection, changeTimeHref } from "../../lib/selection";
import { loadPlaced, clearDetails, type Placed } from "../../lib/drafts";
import { formatDuration, formatPrice } from "../../lib/services";
import { whenLabel } from "../../lib/dates";

export default function Done() {
  const from = typeof location === "undefined" ? "" : new URLSearchParams(location.search).get("from");
  const appt = useSelection();
  const [placed, setPlaced] = useState<Placed | null>(null);
  useEffect(() => { setPlaced(loadPlaced()); }, []);

  if (from === "order" && placed) {
    const a = placed.appointment;
    return (
      <div>
        <h1 className="mt-4 text-h2">We have received your booking</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          Your appointment was placed{placed.email ? <> and an email will follow to <strong className="text-foreground">{placed.email}</strong></> : ""}.
          This page cannot show whether the business has confirmed it yet.
        </p>
        <div className="cf-row mt-8 flex justify-between gap-4">
          <div><p className="font-semibold">{a.serviceName}</p><p className="text-sm text-muted-foreground">{whenLabel(a.startDate)} · {formatDuration(a.minutes)} · {a.staff.name}</p></div>
          <p className="shrink-0 font-semibold">{formatPrice(a.price)}</p>
        </div>
        {a.intro && <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">A video link is sent by email after booking. This page cannot show it.</p>}
        <a href="/" className="btn btn-primary mt-10">Back to Home</a>
      </div>
    );
  }
  if (from === "checkout") {
    return (
      <div>
        <h1 className="mt-4 text-h2">You are back from checkout</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          This page cannot tell whether your payment went through. If you completed it, an email will follow. If you left before paying, your appointment is not booked yet.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {appt && <a href="/book/confirm" className="btn btn-primary">Review my appointment</a>}
          <a href="/" className={`btn ${appt ? "btn-secondary" : "btn-primary"}`}>Back to Home</a>
        </div>
        {appt && (
          <p className="mt-6 text-sm text-muted-foreground">Already paid? <button type="button" className="link-btn" onClick={() => { clearSelection(); clearDetails(); }}>Clear my selection</button> <a className="link-btn" href={changeTimeHref(appt)}>Choose another time</a></p>
        )}
      </div>
    );
  }
  return (
    <div>
      <h1 className="mt-4 text-h2">Nothing to show here</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">There is no booking in this session.</p>
      <a href="/" className="btn btn-primary mt-10">Back to Home</a>
    </div>
  );
}
