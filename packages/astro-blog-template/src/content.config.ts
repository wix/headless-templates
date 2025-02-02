import { wixBlogLoader } from "@wix/astro-blog-loader";
import type { Loader, LoaderContext } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export function blogLoader(): Loader {
  return {
    name: "blog-loader",
    load: async (context: LoaderContext): Promise<void> => {
      await wixBlogLoader().load(context);
      const items = context.store.values();
      context.store.clear();

      for (const item of items) {
        const { data: sdkData } = item as any;

        const data = {
          title: sdkData.title,
          description: sdkData.excerpt,
          pubDate: new Date(sdkData.firstPublishedDate),
          updatedDate: new Date(sdkData.lastPublishedDate),
          heroImage: sdkData.mediaUrl,
          richContent: sdkData.richContent,
        };

        const digest = context.generateDigest(data);

        context.store.set({
          id: (sdkData.slug || item.id) as string,
          data,
          digest,
        });
      }
    },
  };
}

const blog = defineCollection({
  loader: blogLoader(),
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
