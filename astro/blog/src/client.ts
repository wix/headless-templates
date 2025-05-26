import { categories, posts, tags } from "@wix/blog";
import { items } from "@wix/data";
import { createClient, OAuthStrategy } from "@wix/sdk";

export const getWixClient = (
  { modules } = { modules: { items, posts, categories, tags } }
) => {
  const { WIX_CLIENT_ID } = import.meta.env;

  if (!WIX_CLIENT_ID) {
    throw new Error(
      `❌ Wix Client ID is missing! Please create an ".env.local" file with WIX_CLIENT_ID.`
    );
  }

  const wixClient = createClient({
    modules,
    auth: OAuthStrategy({
      clientId: WIX_CLIENT_ID,
    }),
  });

  return wixClient;
};
