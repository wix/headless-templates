# Wix Authentication with External Identity Provider (Github OAuth)

> Join the [Wix Headless community on Discord](https://discord.gg/47gUT9KabP) to get official support, interact with fellow Wix Headless developers and get updates on new releases.

This is a sample project that demonstrates how to authenticate users with Wix using an external identity provider (Github OAuth). 

## When is this useful?

This is useful when you want to authenticate users with Wix using an external identity provider like Github OAuth. In case you already have a user base in an external identity provider, or you want to allow your users to authenticate with an external identity provider for convenience, you can use this project as a reference. This would provide your users with a seamless login experience and still leverage Wix's powerful platform for member management.

## What's in this project?

This project is a Next.js app that demonstrates how to authenticate users with Wix using Github OAuth. It uses the following technologies:

* Next.js (Basic setup)
* Github OAuth (For github authentication) with Octokit
* Wix SDK (For Wix authentication)
* Wix Members API (For member management)

## Pre-requisites

Before you run this project, you need to have the following:

1. A Wix account
2. A Github account
3. A Github App
   * In your github app, be sure to set the following settings:
     * Homepage URL: `http://localhost:3000`
     * Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. A Wix site
5. A Wix API Key with Members & Contacts permission.

## How to run this project?

To run this project, you need to follow these steps:

1. Clone this repository
2. Install the dependencies by running `npm install`
3. Copy the `.env.template` file to `.env.local` and fill in the required values
4. Run the project by running `npm run dev`
5. Open `http://localhost:3000` in your browser and sign in with your Github account
6. If you have set up everything correctly, you should be able to see your Wix member details and be able to update your Wix member profile slug

## How does this work?

Signing in Wix members with an external identity provider requires a few steps:

1. Perform the login with the external identity provider (Github OAuth in this case)
  * This depends on the external identity provider you are using. In this project, we are using Github OAuth to authenticate users.
  * Here we are following the [Github OAuth web flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow) to authenticate users.
  * We use the `@octokit/auth-app` package to finish the web flow and get the github user access token and user info. (See `getGithubAuth` and `getGithubUserEmail` in [`src/app/api/auth/github/callback/route.ts`](src/app/api/auth/github/callback/route.ts))
2. Once the login process in complete, you should have the user's email available. We will be using the email as the unique identifier for the user between Wix and the external identity provider.
3. Next, we want to ensure we have a Wix member created in our side for that email. We use the Wix Members API to create a member if a member with that email adress doesn't exist. (See `getOrCreateWixMember` in [`src/app/api/auth/github/callback/route.ts`](src/app/api/auth/github/callback/route.ts)). Since creating a Wix member (without an explicit registration) is an admin operation, we need to use a `WixClient` with an API Key that has permissions to create members.
4. Once we have a member id for the user, we use the `getMemberTokensForExternalLogin` method on the `OAuthStragegy` to get the tokens for the user. This method will create a session for the user and return the tokens. (See `getMemberTokensForExternalLogin` in [`src/app/api/auth/github/callback/route.ts`](src/app/api/auth/github/callback/route.ts)). Since this is also an admin operation, it requires passing an API Key with the required permissions.
5. Finally, we set the token on a cookie and redirect the user to the home page. The user should now be signed in with Wix.
   
