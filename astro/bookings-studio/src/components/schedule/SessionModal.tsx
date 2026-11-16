// Session details: image, category tag, name, date and time, staff, location, "N of M spots left", price,
// description, and the action. A bottom sheet on phones, a modal from 768px. Every field is the service's, the session's or the
// booking policy's own data, read live. The action follows the card state:
//   book / enroll  -> the booking form              waitlist -> a disabled "Join waitlist" and the limit stated in words
//   full / closed  -> no action, the reason stated
import Overlay, { CloseIcon } from "./Overlay";
import { CalendarIcon, PersonIcon, PinIcon, PeopleIcon } from "./icons";
import { bookHref, courseSpan, courseStatusLabel } from "./TimetableCard";
import { formatMoney, type ServiceDTO } from "../../lib/services";
import type { Session } from "../../lib/schedule";
import { dayLong, dayShort, timeRangeLabel } from "../../lib/dates";

export default function SessionModal({ session: s, service: svc, tz, onClose }: { session: Session; service: ServiceDTO; tz: string; onClose: () => void }) {
  const isCourse = s.kind === "course";
  const price = svc.price ? formatMoney(Number(svc.price.value), svc.price.currency) : "Free";
  const staff = s.staff?.name ?? svc.staff[0]?.name;
  const tag = isCourse ? "Course" : svc.category.name;
  return (
    <Overlay label={svc.name} onClose={onClose}>
      <div className="relative shrink-0">
        {svc.image ? <img src={svc.image} alt="" width="960" height="720" className="h-36 w-full rounded-t-(--radius-sheet) object-cover" /> : <div className="h-36 w-full rounded-t-(--radius-sheet) bg-secondary" />}
        <button type="button" onClick={onClose} aria-label="Close" data-autofocus className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-background hover:bg-transparent hover:shadow-[inset_0_0_0_1px_var(--color-foreground)]"><CloseIcon /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-5">
        {tag && <p className="inline-block rounded-(--radius-control) bg-secondary px-3 py-1 text-xs font-medium">{tag}</p>}
        <h2 className="mt-3 text-h3">{svc.name}</h2>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="mt-1 shrink-0"><CalendarIcon /></span><span>{isCourse && s.course ? <>{courseStatusLabel(s)}: {dayShort(s.course.first)} – {dayShort(s.course.last)} · {s.course.sessions} sessions<br />This session: {dayLong(s.start)} · {timeRangeLabel(s.start, s.end)}</> : <>{dayLong(s.start)} · {timeRangeLabel(s.start, s.end)}</>}</span></li>
          {staff && <li className="flex items-start gap-2"><span className="mt-1 shrink-0"><PersonIcon /></span><span>{staff}</span></li>}
          <li className="flex items-start gap-2"><span className="mt-1 shrink-0"><PinIcon /></span><span>{svc.locationLabel}</span></li>
          <li className="flex items-start gap-2"><span className="mt-1 shrink-0"><PeopleIcon /></span><span>{s.left} of {s.total} spots left</span></li>
        </ul>
        <p className="mt-5 font-medium">{price}{isCourse && s.course ? <span className="font-normal text-muted-foreground"> for {s.course.sessions} sessions</span> : null}</p>
        {svc.description && <p className="mt-4 text-sm text-muted-foreground">{svc.description}</p>}

        <div className="mt-6">
          {s.state === "book" && <a href={bookHref(svc, s, tz)} className="btn btn-primary btn-sm">Book</a>}
          {s.state === "enroll" && <a href={bookHref(svc, s, tz)} className="btn btn-primary btn-sm">Enroll</a>}
          {s.state === "waitlist" && (
            <div className="grid gap-3">
              <button type="button" className="btn btn-primary btn-sm w-fit" disabled aria-describedby="waitlist-limit">Join waitlist</button>
              <p id="waitlist-limit" className="note"><strong>This class is full.</strong> {s.waitlist ? `${s.waitlist.left} of ${s.waitlist.total} waitlist places are open, but joining` : "Joining the waitlist"} is not available online on this site. Contact the business to be added.</p>
            </div>
          )}
          {s.state === "full" && <p className="note"><strong>{isCourse ? "This course is full." : "This class is full."}</strong> There are no spots left{svc.policy.waitlist ? "" : " and no waitlist"}.</p>}
          {s.state === "unavailable" && <p className="note"><strong>Booking is not open for this session.</strong> The booking policy does not allow it right now.</p>}
          {s.state === "enrollment-closed" && <p className="note"><strong>Enrollment is closed.</strong> {s.course?.status === "in-progress" ? `The course started on ${dayShort(s.course.first)}.` : "Bookings for this course have closed."}</p>}
        </div>
      </div>
    </Overlay>
  );
}
