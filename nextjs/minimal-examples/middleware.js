import {createClient, OAuthStrategy} from "@wix/sdk";
import {NextResponse} from "next/server";
import {CLIENT_ID} from "@/constants/constants";
import {installedApps, WixApplications,} from "@/internal/utils/installed-apps";

// This function acts as a middleware for the Next.js application.
// We use this middleware to generate a session for the visitor.
// read more about next.js middleware here https://nextjs.org/docs/app/building-your-application/routing/middleware
export async function middleware(request) {
    // We get the path of the next URL from the request object.
    const path = request.nextUrl.pathname;

    // We check if a session cookie exists.
    // If it doesn't exist, we generate a session for the visitor.
    if (!request.cookies.get("session")) {
        // We create a Wix client using the createClient function from the Wix SDK.
        // We're using the OAuthStrategy for authentication.
        // This strategy requires a client ID.
        const myWixClient = createClient({
            auth: OAuthStrategy({clientId: CLIENT_ID}),
        });

        try {
            // We call the generateVisitorTokens method from the auth module of the Wix client.
            // This method generates a set of tokens for the visitor.
            const visitorTokens = await myWixClient.auth.generateVisitorTokens();

            // We store the tokens in a cookie named "session" in the request object so the cookie would propagate to our pages / routes
            request.cookies.set("session", JSON.stringify(visitorTokens));

            // We create a new response using the NextResponse.next method.
            const response = NextResponse.next({
                request,
            });

            // We also store the tokens in a cookie named "session" in the response.
            response.cookies.set("session", JSON.stringify(visitorTokens));

            // Finally, we return the response.
            return response;
        } catch (error) {
            const message = "Make sure you are using a valid CLIENT_ID";
            return NextResponse.redirect(
                new URL(`/internal/error?message=${message}`, request.url),
            );
        }
    }
    // Check if the requested page corresponds to an installed app
    const appPaths = {
        "/booking": {type: WixApplications.BOOKINGS, name: "Bookings"},
        "/store": {type: WixApplications.STORE, name: "Store"},
        "/events": {type: WixApplications.EVENTS, name: "Events"},
        "/subscriptions": {
            type: WixApplications.SUBSCRIPTIONS,
            name: "Subscriptions",
        },
    };

    // If the path is in the appPaths object, check if the app is installed
    if (path in appPaths) {
        const installedAppsList = await installedApps();
        if (!installedAppsList.includes(appPaths[path].type)) {
            // If the app is not installed, redirect to 404 page
            return NextResponse.redirect(
                new URL(`/404?app=${appPaths[path].name}`, request.url),
            );
        }
    }

    // If everything is okay, proceed with the request
    return NextResponse.next();
}

export const config = {
    unstable_allowDynamic: [
        "**/node_modules/lodash/lodash.js",
        "**/node_modules/lodash/_root.js",
    ],
    matcher: "/",
};
