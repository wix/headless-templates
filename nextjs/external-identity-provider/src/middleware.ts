import { OAuthStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE_NAME } from "./constants";

export async function middleware(request: NextRequest) {
  if (
    !request.cookies.get(WIX_SESSION_COOKIE_NAME) ||
    request.cookies.get(WIX_SESSION_COOKIE_NAME)?.value === ""
  ) {
    const myWixClient = createClient({
      auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
    });

    const visitorTokens = await myWixClient.auth.generateVisitorTokens();
    request.cookies.set(WIX_SESSION_COOKIE_NAME, JSON.stringify(visitorTokens));

    const response = NextResponse.next({
      request,
    });
    response.cookies.set(
      WIX_SESSION_COOKIE_NAME,
      JSON.stringify(visitorTokens)
    );

    return response;
  }
}
