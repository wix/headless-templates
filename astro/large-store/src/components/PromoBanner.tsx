// A promo cell for product grids: a gradient image with title, text and one button, all at the top (top padding = side padding), sized like a product card.
// h-full: the list item is stretched to the row's height (image + name + price + add button), so the
// banner is exactly as tall as its neighbours; aspect-[3/4] is the floor when it is the tallest in its row.
import { imgSrc } from "../wix/media";
import { titleCase } from "../lib/text";
import type { GridBanner } from "../lib/site";

export default function PromoBanner({ banner }: { banner: GridBanner }) {
  return (
    // The spacer sets a 3:4 floor; the li stretches to the row's height, so the banner fills the full card footprint.
    <div className="relative h-full w-full min-w-0">
      <div className="aspect-[3/4] w-full" aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col justify-start overflow-hidden bg-muted p-5 text-foreground lg:p-6">
        <img src={imgSrc(banner.image, 720, 960)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative">
          <h3 className="text-h3">{banner.title}</h3>
          {banner.body && <p className="mt-2 max-w-[28ch] text-muted-foreground">{banner.body}</p>}
          <a href={banner.href} className="btn btn-outline mt-5">{titleCase(banner.ctaLabel)}</a>
        </div>
      </div>
    </div>
  );
}
