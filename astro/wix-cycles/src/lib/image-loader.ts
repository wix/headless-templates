// Custom next/image loader — works with `output: "export"` (no image server).
//
// Unsplash's image CDN resizes on the fly via query params, so for Unsplash
// sources we emit a real responsive srcset by forcing `w`/`q` from the width
// next/image requests (overriding any baked-in w/h in the source URL). Local
// static assets (our small WebP files) are served as-is.
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const [base] = src.split("?")
    const params = new URLSearchParams({
      auto: "format",
      fit: "crop",
      w: String(width),
      q: String(quality ?? 75),
    })
    return `${base}?${params.toString()}`
  }
  // Local files (already-optimized WebP, etc.) — no CDN resizing available.
  return src
}
