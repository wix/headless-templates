import { posts } from "@wix/blog";
import { createClient, media, OAuthStrategy } from "@wix/sdk";
import type { Loader, LoaderContext } from "astro/loaders";

const getWixClient = () => {
  const { PUBLIC_WIX_CLIENT_ID } = import.meta.env;

  if (!PUBLIC_WIX_CLIENT_ID) {
    throw new Error(
      `❌ Wix Client ID is missing! Please create an ".env.local" file with PUBLIC_WIX_CLIENT_ID.`
    );
  }

  const wixClient = createClient({
    modules: { posts },
    auth: OAuthStrategy({
      clientId: PUBLIC_WIX_CLIENT_ID,
    }),
  });

  return wixClient;
};

enum PostFieldField {
  RICH_CONTENT = "RICH_CONTENT",
  CONTENT_TEXT = "CONTENT_TEXT",
}

export function wixLoader(): Loader {
  return {
    name: "wix-loader",
    load: async (context: LoaderContext) => {
      const { items } = await getWixClient()
        .use(posts)
        .queryPosts({
          fieldsets: [PostFieldField.RICH_CONTENT, PostFieldField.CONTENT_TEXT],
        })
        .find();

      for (const item of items) {
        const id = item.slug as string;
        const data = await context.parseData({
          id,
          data: {
            title: item.title,
            description: item.excerpt,
            pubDate: item.firstPublishedDate,
            updatedDate: item.lastPublishedDate,
            ...(item.media?.wixMedia?.image && {
              heroImage: media.getImageUrl(item.media?.wixMedia?.image).url,
            }),
          },
        });

        const digest = context.generateDigest(data);

        context.store.set({
          id,
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
