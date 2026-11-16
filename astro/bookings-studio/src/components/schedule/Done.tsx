// After Book now. This page can only say what the visitor's own calls returned, because the booking cannot be read back
// without the elevated anonymous-token call. Two honest cases, and a third for a visit with nothing
// to show. It never says "confirmed".
import { useEffect, useState } from "react";
import { loadPlaced, loadPending, clearPending, clearDetails, type Placed, type Pending } from "../../lib/drafts";

export default function Done({ from }: { from: string }) {
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  useEffect(() => { setPlaced(loadPlaced()); setPending(loadPending()); }, []);

  if (from === "order" && placed) {
    return (
      <div>
        <h1 className="mt-4 text-h2">We have received your booking</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          Your {placed.kind === "course" ? "enrollment was" : "booking was"} placed{placed.email ? <> and an email will follow to <strong className="text-foreground">{placed.email}</strong></> : ""}.
          This page cannot show whether the business has confirmed it yet.
        </p>
        <div className="mt-8 flex justify-between gap-4 rounded-(--radius-card) bg-secondary px-4 py-4">
          <div><p className="font-medium">{placed.serviceName}</p><p className="text-sm text-muted-foreground">{placed.when} · {placed.participants} {placed.participants === 1 ? "participant" : "participants"}</p></div>
          <p className="shrink-0 font-medium">{placed.total}</p>
        </div>
        <a href="/" className="btn btn-primary mt-10">Back to Home</a>
      </div>
    );
  }
  if (from === "checkout") {
    return (
      <div>
        <h1 className="mt-4 text-h2">You are back from checkout</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">
          This page cannot tell whether your payment went through. If you completed it, an email will follow. If you left before paying, your booking is not complete.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          {pending && <a href={pending.href} className="btn btn-primary">Back to the booking form</a>}
          <a href="/#schedule" className={`btn ${pending ? "btn-secondary" : "btn-primary"}`}>View schedule</a>
        </div>
        {pending && <p className="mt-6 text-sm text-muted-foreground">Already paid? <button type="button" className="link-btn" onClick={() => { clearPending(); clearDetails(); setPending(null); }}>Clear my details</button></p>}
      </div>
    );
  }
  return (
    <div>
      <h1 className="mt-4 text-h2">Nothing to show here</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">There is no booking in this session.</p>
      <a href="/#schedule" className="btn btn-primary mt-10">View schedule</a>
    </div>
  );
}
