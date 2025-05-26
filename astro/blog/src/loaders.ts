import { media } from "@wix/sdk";
import { categories, posts, tags } from "@wix/blog";
import type { Loader, LoaderContext } from "astro/loaders";
import { getWixClient } from "./client.js";

enum PostFieldField {
  RICH_CONTENT = "RICH_CONTENT",
  CONTENT_TEXT = "CONTENT_TEXT",
}

export function wixBlogLoader(transform = (item: any) => item): Loader {
  console.log("wixBlogLoader");
  return {
    name: "wix-blog-loader",
    load: async (context: LoaderContext) => {
      const { items } = await getWixClient()
        .use(posts)
        .queryPosts({
          fieldsets: [PostFieldField.RICH_CONTENT, PostFieldField.CONTENT_TEXT],
        })
        .find();

      const useCategories = getWixClient().use(categories);
      const useTags = getWixClient().use(tags);

      for (const item of items) {
        const categoriesResponse = await Promise.all(
          (item.categoryIds || []).map(async (categoryId) => {
            const { category } = await useCategories.getCategory(categoryId);
            return category;
          })
        );
        const { items: tagsResponse } = await useTags.queryTags().find();

        const data = transform({
          ...item,
          ...(item.media?.wixMedia?.image && {
            mediaUrl: media.getImageUrl(item.media?.wixMedia?.image).url,
          }),
          categories: categoriesResponse,
          tags: tagsResponse,
        });

        const digest = context.generateDigest(data);

        context.store.set({
          id: data.id,
          data,
          digest,
          rendered: {
            html: item.contentText || "",
          },
        });
      }
    },
  };
}
