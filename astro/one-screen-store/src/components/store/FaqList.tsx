// FAQ rows: the same accordion as the product page's info sections — a button row that fades on hover; its answer's
// height grows from 0 (a grid row from 0fr to 1fr) while the text fades and settles in, and the chevron turns.
import { useState } from "react";
import { ChevronDown } from "../Icons";

type Faq = { question: string; answer: string; linkHref?: string; linkLabel?: string };

function FaqRow({ f, k }: { f: Faq; k: number }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${k}`;
  return (
    <div className="border-t border-border last:border-b">
      <h2 className="text-lg font-medium leading-normal tracking-normal [font-family:inherit] [text-wrap:wrap]">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
          className="text-btn flex min-h-14 w-full items-center justify-between gap-4 py-2 text-left">
          {f.question}<ChevronDown className={`shrink-0 transition-transform duration-[360ms] ease-(--ease-push) ${open ? "rotate-180" : ""}`} />
        </button>
      </h2>
      <div id={id} role="region" aria-label={f.question} className={`info-body grid ${open ? "is-open" : ""}`} {...(open ? {} : ({ inert: "" } as Record<string, string>))}>
        <div className="min-h-0 overflow-hidden">
          <div className="info-text pb-6">
            <p className="max-w-[60ch] text-muted-foreground">{f.answer}</p>
            {f.linkHref && <a href={f.linkHref} className="link-btn mt-1">{f.linkLabel}</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return <div className="mt-(--gutter) max-w-[48rem]">{faqs.map((f, k) => <FaqRow key={k} f={f} k={k} />)}</div>;
}
