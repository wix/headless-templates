import { posts } from "@wix/blog";
import { createClient, media, OAuthStrategy } from "@wix/sdk";
import type { Loader, LoaderContext } from "astro/loaders";

const getWixClient = () => {
  const wixClient = createClient({
    modules: { posts },
    auth: OAuthStrategy({
      clientId: import.meta.env.PUBLIC_WIX_CLIENT_ID,
    }),
  });

  return wixClient;
};

enum PostFieldField {
  RICH_CONTENT = "RICH_CONTENT",
}

export function wixLoader(): Loader {
  return {
    name: "wix-loader",
    load: async (context: LoaderContext) => {
      const { items } = await getWixClient()
        .use(posts)
        .queryPosts({ fieldsets: [PostFieldField.RICH_CONTENT] })
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
            html: JSON.stringify(item.richContent),
          },
        });
      }
    },
  };
}
