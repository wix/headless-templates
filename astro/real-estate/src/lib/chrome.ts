// What every page's header and footer need, read once per request (memoized 30 s: the layout and the page both ask for it).
import { getCopy, getSocialLinks, getLegalPages, type CopyBlock, type SocialLink, type LegalPage } from "./content";

export type Chrome = { copy: Record<string, CopyBlock>; social: SocialLink[]; legal: LegalPage[] };
let memo: { at: number; value: Chrome } | null = null;
export async function getChrome(): Promise<Chrome> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  const [copy, social, legal] = await Promise.all([getCopy(), getSocialLinks(), getLegalPages()]);
  memo = { at: Date.now(), value: { copy, social, legal } };
  return memo.value;
}
