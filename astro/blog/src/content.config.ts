import { wixBlogLoader } from "@wix/astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: wixBlogLoader((item) => ({
    id: item.slug,
    title: item.title,
    description: item.excerpt,
    pubDate: new Date(item.firstPublishedDate),
    updatedDate: new Date(item.lastPublishedDate),
    heroImage: item.mediaUrl,
    richContent: item.richContent,
  })),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    richContent: z.any(),
  }),
});

export const collections = { blog };
