const SMALL = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "via", "vs"]);

/** Button-label capitalisation: every word starts with a capital except short articles / conjunctions / prepositions
 *  ("Add to Cart", "Choose Color and Size"); the first and last word are always capitalised. */
export function titleCase(label: string): string {
  const words = label.split(" ");
  return words.map((w, i) => {
    if (!w || (SMALL.has(w.toLowerCase().replace(/[^\p{L}]+$/u, "")) && i > 0 && i < words.length - 1)) return w;
    return w.replace(/^([^\p{L}]*)(\p{L})/u, (_, pre: string, c: string) => pre + c.toUpperCase());
  }).join(" ");
}
