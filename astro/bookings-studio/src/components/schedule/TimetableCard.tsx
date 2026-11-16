// The Timetable Card: ONE component, six states.
//   Class · Book / Class · Waitlist / Class · Full          (eventTimeSlots: capacity fields, eventInfo.waitingList)
//   Course · Enroll / Course · Enrollment closed            (Calendar events: remainingCapacity; closed derived from the course policy)
//   Empty                                                   (see EmptyDay)
// The card draws what its Session says; it decides nothing. Controls that cannot be completed by a visitor are never drawn as
// live: a full class says "Full" as plain text, "Waitlist" opens the details where the limit is stated, a closed course says so.
import { formatMoney, type ServiceDTO } from "../../lib/services";
import { LOW_SPOTS, ribbonOf, type Session } from "../../lib/schedule";
import { dayShort, timeLabel } from "../../lib/dates";
import { ArrowRight, FlameIcon } from "./icons";

export const bookHref = (svc: ServiceDTO, s: Session | null, tz: string) =>
  `/schedule/book?service=${encodeURIComponent(svc.slug)}${s && svc.type === "CLASS" ? `&start=${encodeURIComponent(s.start)}` : ""}&tz=${encodeURIComponent(tz)}`;

/** Level tag on the card: set from the CMS (ContentItems group "levels"). */
export const levelOf = (svc: ServiceDTO) => svc.level ?? "";
export const spotsText = (s: Session) => (s.left > 0 ? `${s.left} ${s.left === 1 ? "Spot" : "Spots"} Left` : "No Spots Left");
/** "N spots left" is shown only when a few remain (LOW_SPOTS or fewer), with a flame; plenty of room, Full and Waitlist say nothing here. */
export const isLow = (s: Pick<Session, "state" | "left">) => (s.state === "book" || s.state === "enroll") && s.left > 0 && s.left <= LOW_SPOTS;

export const courseStatusLabel = (s: Session) => (s.course?.status === "in-progress" ? "In progress" : "Upcoming");
export const courseSpan = (s: Session) => (s.course ? `${dayShort(s.course.first)} – ${dayShort(s.course.last)}` : "");

export default function TimetableCard({ session: s, service: svc, tz, onOpen }: { session: Session; service: ServiceDTO; tz: string; onOpen: (s: Session) => void }) {
  const isCourse = s.kind === "course";
  const price = svc.price ? formatMoney(Number(svc.price.value), svc.price.currency) : "Free";
  const staff = s.staff?.name ?? svc.staff[0]?.name;
  const rb = ribbonOf(s);
  const level = levelOf(svc);
  return (
    <article className="tt-card" data-state={s.state} data-kind={s.kind} aria-label={`${svc.name}, ${timeLabel(s.start)}`}>
      <div className="tt-media">
        {svc.thumb && <img src={svc.thumb} alt="" width="480" height="360" loading="lazy" decoding="async" />}
        {level && <span className="tt-tag">{level}</span>}
        {/* The ribbon repeats what the spots line below says, so it is hidden from assistive tech (no double reading). */}
        {rb && <span className="ribbon" data-kind={rb.kind} aria-hidden="true">{rb.kind === "low" && <FlameIcon />}{rb.label}</span>}
      </div>
      <div className="tt-body">
        <p className="tt-time">{timeLabel(s.start)} ({s.minutes} min)</p>
        <h3 className="tt-name">{svc.name}</h3>
        {staff && <p className="tt-meta">{staff}</p>}
        <button type="button" className="tt-more" onClick={() => onOpen(s)} aria-label={`Read more about ${svc.name}, ${timeLabel(s.start)}`}>Read more</button>
      </div>
      <div className="tt-foot">
        <p className="tt-price">{price}{isCourse && s.course ? <span className="tt-meta"> · {s.course.sessions} sessions</span> : null}</p>
        {isLow(s) && <p className="tt-spots" data-low="true"><FlameIcon />{spotsText(s)}</p>}
        {s.state === "book" && <a className="tt-action" href={bookHref(svc, s, tz)}>Book <ArrowRight /></a>}
        {s.state === "enroll" && <a className="tt-action" href={bookHref(svc, s, tz)}>Enroll <ArrowRight /></a>}
        {s.state === "waitlist" && <button type="button" className="tt-action" onClick={() => onOpen(s)} aria-label={`Waitlist for ${svc.name}, ${timeLabel(s.start)}: details`}>Waitlist <ArrowRight /></button>}
        {s.state === "full" && <span className="tt-action" data-off="true">Full</span>}
        {s.state === "unavailable" && <span className="tt-action" data-off="true">Not available</span>}
        {s.state === "enrollment-closed" && <span className="tt-action" data-off="true">Enrollment closed</span>}
      </div>
    </article>
  );
}

/** The Empty state: a day with nothing (or a filler cell that completes the desktop grid). */
export function EmptyDay({ filler = false, onNext, nextLabel }: { filler?: boolean; onNext?: () => void; nextLabel?: string }) {
  if (filler) return <div className="tt-empty" data-filler="true" aria-hidden="true" />;
  return (
    <div className="tt-empty" role="status">
      <p>No sessions</p>
      {onNext && <button type="button" className="btn btn-secondary btn-sm" onClick={onNext}>{nextLabel ?? "Next day with sessions"}</button>}
    </div>
  );
}
