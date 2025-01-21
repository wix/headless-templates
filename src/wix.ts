import { posts } from "@wix/blog";
import { createClient, OAuthStrategy } from "@wix/sdk";

export const getWixClient = () => {
  const wixClient = createClient({
    modules: { posts },
    auth: OAuthStrategy({
      clientId: import.meta.env.PUBLIC_WIX_CLIENT_ID,
    }),
  });

  return wixClient;
};
