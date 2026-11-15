// Product gallery. Phones/tablets: a swipeable track with a position indicator
// and thumbs beneath. Desktop: every image stacked in one column, with a
// sticky "IMG 01 / 05" bar of thumbnails that follows the scroll and jumps to
// an image on click (anchors).
import { useEffect, useRef, useState } from "react";
import { imgSrc, imgSrcSet } from "../lib/store";

// Small thumbnails: fetched well above display size, higher quality, no sharpening (keeps soft shapes smooth).
const THUMB = { quality: 90, unsharpMask: { radius: 0, amount: 0, threshold: 0 } };

export default function PdpGallery({ images, name }: { images: { m: any; alt: string; key: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const n = images.length;
  useEffect(() => {
    const el = track.current; if (!el) return;
    const on = () => { const k = Math.round(el.scrollLeft / el.clientWidth); if (k !== i) setI(Math.max(0, Math.min(n - 1, k))); };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, [i, n]);
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesk(mq.matches); on();
    mq.addEventListener("change", on); return () => mq.removeEventListener("change", on);
  }, []);
  // Desktop: the active image is the one crossing the middle of the viewport.
  useEffect(() => {
    const el = track.current; if (!desk || !el) return;
    const frames = [...el.children] as HTMLElement[];
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const mid = window.innerHeight / 2;
      let best = 0, d = Infinity;
      frames.forEach((f, k) => { const r = f.getBoundingClientRect(); const dist = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid)); if (dist < d) { d = dist; best = k; } });
      setI(best);
    }); };
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [desk, n]);
  const go = (k: number) => {
    setI(k);
    const el = track.current; if (!el) return;
    if (desk) (el.children[k] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };
  const pad = (x: number) => String(x).padStart(2, "0");
  if (!n) return <div className="pdp-gallery"><div className="media media--product pdp-gallery__frame"><span className="media__fallback" /></div></div>;
  return (
    <div className="pdp-gallery">
      <div ref={track} className="pdp-gallery__track" aria-roledescription="carousel" aria-label={`${name} images`} tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(Math.min(n - 1, i + 1)); if (e.key === "ArrowLeft") go(Math.max(0, i - 1)); }}>
        {images.map((im, k) => (
          <div key={im.key} className="media media--product pdp-gallery__frame" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
            <img src={imgSrc(im.m, 1000, 1250)} srcSet={imgSrcSet(im.m, 1.25, [480, 720, 1000, 1400])} sizes="(min-width: 1024px) 55vw, 100vw"
              width={1000} height={1250} alt={im.alt} loading={k === 0 ? "eager" : "lazy"} fetchPriority={k === 0 ? "high" : undefined} />
          </div>
        ))}
      </div>
      {n > 1 ? (
        <>
          <p className="pdp-gallery__pos" aria-live="polite"><span className="sr-only">Image </span>{i + 1} / {n}</p>
          <div className="pdp-gallery__thumbs" role="group" aria-label="Choose image">
            {images.map((im, k) => (
              <button key={im.key} type="button" className="pdp-gallery__thumb" aria-current={k === i} aria-label={`Show image ${k + 1}`} onClick={() => go(k)}>
                <img src={imgSrc(im.m, 256, 320, THUMB)} width={64} height={80} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="pdp-gallery__bar" role="group" aria-label="Jump to image">
            <p className="pdp-gallery__count" aria-live="polite"><span className="pdp-gallery__label">IMG</span> <span className="pdp-gallery__num">{pad(i + 1)} / {pad(n)}</span></p>
            <div className="pdp-gallery__bar-thumbs">
              {images.map((im, k) => (
                <button key={im.key} type="button" className="pdp-gallery__thumb" aria-current={k === i} aria-label={`Go to image ${k + 1}`} onClick={() => go(k)}>
                  <img src={imgSrc(im.m, 192, 240, THUMB)} width={44} height={55} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
