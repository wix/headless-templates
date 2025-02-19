import OpengraphImage from 'components/opengraph-image';
import { getPage } from 'lib/wix';
import { notFound } from 'next/navigation';

export default async function Image({ params }: { params: { page: string } }) {
  const page = await getPage(params.page);
  if (!page) return notFound();

  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
