import { wixBlogLoader } from "@wix/astro-blog-loader";
import type { Loader, LoaderContext } from "astro/loaders";
import { defineCollection } from "astro:content";

export function blogLoader(): Loader {
  return {
    name: "blog-loader",
    load: async (context: LoaderContext): Promise<void> => {
      await wixBlogLoader().load(context);

      for (const [, item] of context.store.entries()) {
        const data = {
          title: item.data.title,
          description: item.data.excerpt,
          pubDate: new Date(`${item.data.firstPublishedDate}`),
          updatedDate: new Date(`${item.data.lastPublishedDate}`),
          heroImage: item.data.media,
        };

        const digest = context.generateDigest(data);

        context.store.set({
          ...item,
          data,
          digest,
        });
      }
    },
  };
}

const blog = defineCollection({
  loader: blogLoader(),
});

export const collections = { blog };
