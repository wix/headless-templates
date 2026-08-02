import { posts } from '@wix/blog';
import { media } from '@wix/sdk';

export interface SeoTag {
  type?: string;
  children?: string;
  disabled?: boolean;
  props?: Record<string, string>;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentText?: string;
  firstPublishedDate?: string;
  lastPublishedDate?: string;
  richContent?: unknown;
  seoData?: {
    tags?: SeoTag[];
  };
  media?: {
    wixMedia?: {
      image?: string;
    };
  };
}

export function getCoverUrl(post: Post, w = 800, h = 500): string | null {
  const ref = post?.media?.wixMedia?.image;
  if (!ref) return null;
  if (typeof ref === 'string' && ref.startsWith('wix:image://')) {
    return media.getScaledToFillImageUrl(ref, w, h, {});
  }
  return typeof ref === 'string' ? ref : null;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function readingTime(post: Post): string {
  const text = post.contentText ?? post.excerpt ?? '';
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export async function queryAllPosts(): Promise<Post[]> {
  try {
    const res = await posts
      .queryPosts({ fieldsets: ['URL', 'CONTENT_TEXT'] })
      .descending('firstPublishedDate')
      .limit(20)
      .find();
    return (res.items ?? []) as Post[];
  } catch (error) {
    console.error('Failed to query blog posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await posts
      .queryPosts({ fieldsets: ['RICH_CONTENT', 'CONTENT_TEXT', 'SEO', 'URL'] })
      .eq('slug', slug)
      .find();
    return (res.items?.[0] ?? null) as Post | null;
  } catch (error) {
    console.error(`Failed to fetch blog post "${slug}":`, error);
    return null;
  }
}
