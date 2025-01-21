import { posts } from "@wix/blog";
import { media } from "@wix/sdk";
import { defineCollection, z } from "astro:content";
import { getWixClient } from "./wix";

const blog = defineCollection({
  loader: async () => {
    const { items } = await getWixClient().use(posts).queryPosts().find();
    return items.map((item) => {
      return {
        id: item.slug as string,
        title: item.title,
        description: item.excerpt,
        pubDate: item.firstPublishedDate,
        updatedDate: item.lastPublishedDate,
        ...(item.media?.wixMedia?.image && {
          heroImage: media.getImageUrl(item.media?.wixMedia?.image).url,
        }),
      };
    });
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog };
