// The header's "Book now": a plain link to the services page until the visitor has appointments in their list; then it
// carries their count and opens Confirm as the side drawer instead.
import { useState } from "react";
import { useAppointments } from "../lib/cart";
import ConfirmDrawer from "./booking/ConfirmDrawer";

export default function HeaderBook({ label, policies }: { label: string; policies: { name: string; lines: string[] }[] }) {
  const appts = useAppointments();
  const [open, setOpen] = useState(false);
  const n = appts.length;
  if (n === 0 && !open) return <a href="/book" className="btn btn-primary btn-sm">{label}</a>;
  return (
    <>
      <button type="button" className="btn btn-primary btn-sm header-book" onClick={() => setOpen(true)} aria-haspopup="dialog"
        aria-label={`${label}, ${n} ${n === 1 ? "appointment" : "appointments"} selected`}>
        {label}<span className="header-book__count" aria-hidden="true">{n}</span>
      </button>
      <ConfirmDrawer open={open} onClose={() => setOpen(false)} policies={policies} />
    </>
  );
}
