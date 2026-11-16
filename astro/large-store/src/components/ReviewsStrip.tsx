// Testimonials as one bordered strip: a summary cell (rating, stars, count) followed by the quotes, separated by hairlines,
// swiped or paged with the two arrows underneath. On desktop the strip is always four equal columns: the summary + three quotes. Square-edged, greyscale, ink stars — the site's own look.
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "./Icons";

const Star = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" /></svg>;

export default function ReviewsStrip({ quotes, title, summary: REVIEW_SUMMARY }: { quotes: { quote: string; name: string }[]; title?: string; summary?: { rating: string; count: string; note: string } | null }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false, overflow: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setEdge({ overflow: el.scrollWidth > el.clientWidth + 4, start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", measure); ro.disconnect(); };
  }, []);

  // one quote per press
  const by = (dir: 1 | -1) => {
    const el = track.current;
    const cell = el?.querySelector("li");
    if (el && cell) el.scrollBy({ left: dir * cell.getBoundingClientRect().width, behavior: "smooth" });
  };
  const arrow = "hbtn inline-flex h-11 w-11 items-center justify-center bg-foreground text-background transition-[opacity,background-color,color] duration-[160ms] hover:bg-background hover:text-foreground disabled:opacity-30 disabled:hover:bg-foreground disabled:hover:text-background";

  return (
    <div>
      {title && <h2 className="text-h2">{title}</h2>}
      <div className={`${title ? "mt-8 lg:mt-10" : ""} border border-border lg:flex`}>
        {REVIEW_SUMMARY && (
          <div className="flex flex-col items-center justify-center gap-3 border-b border-border px-6 py-8 text-center lg:w-1/4 lg:shrink-0 lg:border-b-0 lg:border-r">
            <p className="font-display text-[4.5rem] font-medium leading-none tracking-tight lg:text-[5.5rem]">{REVIEW_SUMMARY.rating}</p>
            <div className="flex gap-1 text-foreground" role="img" aria-label={`${REVIEW_SUMMARY.rating} out of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} />)}</div>
            <p className="text-base font-medium">{REVIEW_SUMMARY.count}</p>
            <p className="text-base text-muted-foreground">{REVIEW_SUMMARY.note}</p>
          </div>
        )}
        <ul ref={track} className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quotes.map((q, i) => (
            <li key={i} className="flex w-[78%] shrink-0 snap-start flex-col border-border p-6 md:w-1/2 lg:w-1/3 [&:not(:first-child)]:border-l">
              <blockquote className="text-[1.25rem] leading-snug lg:text-[1.375rem]">“{q.quote}”</blockquote>
              <p className="mt-auto pt-10 text-base font-medium">{q.name}</p>
            </li>
          ))}
        </ul>
      </div>
      {edge.overflow && (
        <div className="mt-6 flex gap-3">
          <button type="button" className={arrow} aria-label="Previous review" disabled={edge.start} onClick={() => by(-1)}><ChevronLeft /></button>
          <button type="button" className={arrow} aria-label="Next review" disabled={edge.end} onClick={() => by(1)}><ChevronRight /></button>
        </div>
      )}
    </div>
  );
}
