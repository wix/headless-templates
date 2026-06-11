import { OAuthStrategy, createClient } from "@wix/sdk";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE_NAME } from "./constants";
import { members } from "@wix/members";

export function getServerWixClient() {
  const wixSessionCookie = cookies().get(WIX_SESSION_COOKIE_NAME);

  return createClient({
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens:
        wixSessionCookie && wixSessionCookie.value
          ? JSON.parse(wixSessionCookie.value)
          : undefined,
    }),
    modules: {
      members,
    },
  });
}
