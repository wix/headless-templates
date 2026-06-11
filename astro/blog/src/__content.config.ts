import { z } from "astro/zod";
import { posts } from '@wix/blog';
import { defineCollection } from "astro:content";
import { wixBlogLoader } from "./loaders";

const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  richContent: z.any(),
});

const blog = defineCollection({
  loader: wixBlogLoader((item: posts.Post) => ({
    id: item.slug,
    title: item.title,
    description: item.excerpt,
    pubDate: new Date(item.firstPublishedDate ?? ''),
    updatedDate: new Date(item.lastPublishedDate ?? ''),
    heroImage: item.media?.wixMedia?.image,
    richContent: item.richContent,
  })),
  schema: postSchema,
});

export const collections = { blog };
