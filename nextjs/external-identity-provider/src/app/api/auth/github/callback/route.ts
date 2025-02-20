import { getServerWixClient } from "@/serverWixClient";
import { createAppAuth, createOAuthUserAuth } from "@octokit/auth-app";
import { members } from "@wix/members";
import { ApiKeyStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const githubAccessToken = await getGithubAuth(request);

  const userEmail = await getGithubUserEmail(githubAccessToken);

  const member = await getOrCreateWixMember(userEmail);

  const memberTokens =
    await getServerWixClient().auth.getMemberTokensForExternalLogin(
      member._id!,
      process.env.WIX_API_KEY!
    );

  const response = new NextResponse(undefined, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
  response.cookies.set("wixSession", JSON.stringify(memberTokens));

  return response;
}

async function getGithubAuth(request: NextRequest) {
  const appAuth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  });

  const userAuth = await appAuth({
    type: "oauth-user",
    code: request.nextUrl.searchParams.get("code")!,
    factory: createOAuthUserAuth,
  });

  const authentication = await userAuth();
  return authentication.token;
}

async function getGithubUserEmail(token: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const userInfo = await res.json();

  return userInfo.email;
}

async function getOrCreateWixMember(email: string) {
  const wixAdminClient = createClient({
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      siteId: process.env.WIX_SITE_ID!,
    }),
    modules: {
      members,
    },
  });

  const { items } = await wixAdminClient.members
    .queryMembers()
    .eq("loginEmail", email)
    .find();

  let member;
  if (items.length === 0) {
    member = await wixAdminClient.members.createMember({
      member: {
        loginEmail: email,
        status: members.Status.APPROVED,
        privacyStatus: members.PrivacyStatusStatus.PRIVATE,
      },
    });
  } else {
    member = items[0];
  }
  return member;
}
