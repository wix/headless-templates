import { media } from "@wix/sdk";
import { categories, posts, tags } from "@wix/blog";
import type { Loader, LoaderContext } from "astro/loaders";

enum PostFieldField {
  RICH_CONTENT = "RICH_CONTENT",
  CONTENT_TEXT = "CONTENT_TEXT",
}

export function wixBlogLoader(transform = (item: any) => item): Loader {
  return {
    name: "wix-blog-loader",
    load: async (context: LoaderContext) => {
      const { items } = await posts.queryPosts({
        fieldsets: [PostFieldField.RICH_CONTENT, PostFieldField.CONTENT_TEXT],
      }).find();

      for (const item of items) {
        const categoriesResponse = await Promise.all(
          (item.categoryIds || []).map(async (categoryId) => {
            const { category } = await categories.getCategory(categoryId);
            return category;
          })
        );
        const { items: tagsResponse } = await tags.queryTags().find();

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