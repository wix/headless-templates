// Select Service: Back, "Select Service", category filter chips (All + categories), then one grid of service cards
// (photo with chips, name, description; Book Now with the price on hover).
// Rendered on the server from the live service list, hydrated for the chips and the details modal.
import { useEffect, useMemo, useState } from "react";
import { formatDuration, formatPrice, type ServiceDTO } from "../../lib/services";

export default function ServiceList({ services }: { services: ServiceDTO[] }) {
  // Categories become filters over one grid (All + each category); the list itself is never split into sections.
  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    for (const s of services) if (!seen.has(s.category.id)) seen.set(s.category.id, { id: s.category.id, name: s.category.name });
    return [...seen.values()];
  }, [services]);
  const [active, setActive] = useState<string>("all");
  // A link to /book#svc-<slug>: scroll to that card once the list is on the page.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
  }, []);
  const shown = active === "all" ? services : services.filter((s) => s.category.id === active);

  if (services.length === 0) return <p className="mt-10 text-muted-foreground">No services are available to book right now.</p>;
  return (
    <>
      {categories.length > 1 && (
        <div className="chip-rail mt-(--gutter)" role="group" aria-label="Filter by category">
          <button type="button" className="chip" aria-pressed={active === "all"} onClick={() => setActive("all")}>All</button>
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={active === c.id} onClick={() => setActive(c.id)}>{c.name}</button>
          ))}
        </div>
      )}
      {/* One grid of cards like the home service cards; the whole card books, and a full-width Book Now (with the price)
          slides up out of a mask on hover (always shown on touch screens). */}
      <ul className="book-list" key={active}>
        {shown.map((s, i) => (
          <li key={s.id} id={`svc-${s.slug}`} className="book-tile" style={{ animationDelay: `${i * 50}ms` }}>
            <a href={`/book/time?service=${encodeURIComponent(s.slug)}`} className="book-tile__link" aria-label={`Book ${s.name}, ${formatPrice(s.price)}`}>
              <div className="book-tile__media">
                {s.image ? <img src={s.image} alt="" width="960" height="720" loading="lazy" /> : null}
                <div className="book-tile__tags">
                  {categories.length > 1 && <span className="book-tile__tag">{s.category.name}</span>}
                  <span className="book-tile__tag">{formatDuration(s.minutes)}</span>
                  {s.price === null && s.payment.inPerson && <span className="book-tile__tag">Pay in person</span>}
                </div>
              </div>
              <div className="book-tile__body">
                <h2 className="book-tile__name">{s.name}</h2>
                {s.description && <p className="book-tile__desc">{s.description}</p>}
                <span className="book-tile__cta" aria-hidden="true"><span className="btn btn-primary book-tile__book"><span>Book Now</span><span className="book-tile__price">{formatPrice(s.price)}</span></span></span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
