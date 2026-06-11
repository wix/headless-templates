import Cookies from "js-cookie";
import React, {useEffect, useState} from "react";

import {createClient, OAuthStrategy} from "@wix/sdk";
import {members} from "@wix/members";
import {CLIENT_ID} from "@/constants/constants";
import {useAsyncHandler} from "@/src/hooks/async-handler";
import {checkDefaultClientId, checkSandboxEnvironment,} from "@/internal/utils/enviroment-check";
import {useModal} from "@/internal/providers/modal-provider";

// We're creating a Wix client using the createClient function from the Wix SDK.
const myWixClient = createClient({
    // We specify the modules we want to use with the client.
    // In this case, we're using the members' module.
    modules: {members},

    // We're using the OAuthStrategy for authentication.
    // This strategy requires a client ID and a set of tokens.
    auth: OAuthStrategy({
        // The client ID is a unique identifier for the application.
        // It's used to authenticate the application with the Wix platform.
        clientId: CLIENT_ID,

        // The tokens are used to authenticate the user.
        // In this case, we're getting the tokens from a cookie named "session".
        // If the cookie doesn't exist, we default to null.
        tokens: JSON.parse(Cookies.get("session") || null),
    }),
});

export default function LoginBar() {
    // State variable to store the current member.
    const [member, setMember] = useState(null);
    const {openModal} = useModal();
    const handleAsync = useAsyncHandler();

    // This function fetches the current member.
    async function fetchMember() {
        await handleAsync(async () => {
            // We check if the user is logged in using the loggedIn method from the auth module of the Wix client.
            // If the user is logged in, we call the getCurrentMember method from the members module of the Wix client.
            // This method retrieves the current member.
            // If the user is not logged in, we default to an empty object.
            const {member} = myWixClient.auth.loggedIn()
                ? await myWixClient.members.getCurrentMember()
                : {};

            // Then, we update the state of the member in the React component.
            // If the member is undefined, we default to undefined.
            setMember(member || undefined);
        });
    }

    // This function initiates the login process.
    async function login() {
        // INTERNAL: If the user is running the app in the CodeSandbox environment, we display a message.
        if (checkSandboxEnvironment() && checkDefaultClientId()) {
            openModal("login");
            return; // Stop the login process if in sandbox environment
        }

        // We wrap the login process in a try-catch block to handle any errors that may occur.
        try {
            await handleAsync(async () => {
                // We call the generateOAuthData method from the auth module of the Wix client.
                // This method generates the necessary data for the OAuth authentication process.
                // We specify the redirect URI for the authentication callback page.
                const data = myWixClient.auth.generateOAuthData(
                    `${window.location.origin}/login-callback`,
                    window.location.href,
                );

                // We store the generated OAuth data in the local storage.
                // This data will be used later in the authentication process.
                localStorage.setItem("oauthRedirectData", JSON.stringify(data));

                // We call the getAuthUrl method from the auth module of the Wix client.
                // This method generates the URL for the authentication page.
                const {authUrl} = await myWixClient.auth.getAuthUrl(data);

                // Finally, we redirect the user to the authentication page.
                window.location = authUrl; // Wix auth will send the user back to the callback page (login-callback.js)
            });
        } catch (error) {
            // If an error occurs during the login process, we log the error to the console.
            console.error("Login error:", error);
        }
    }

    // This function initiates the logout process.
    async function logout() {
        await handleAsync(async () => {
            // We call the logout method from the auth module of the Wix client.
            // This method generates the URL for the logout page.
            // We pass the current page URL as the parameter.
            const {logoutUrl} = await myWixClient.auth.logout(window.location.href);

            // We remove the session cookie.
            // This effectively logs the user out on the client side.
            Cookies.remove("session");

            // Finally, we redirect the user to the logout page.
            window.location = logoutUrl;
        });
    }

    // open login modal when clicking the login button
    const handleLoginModal = () => {
        myWixClient.auth.loggedIn() ? logout() : login();
    };

    // Fetch the current member when the component mounts.
    useEffect(() => {
        fetchMember();
    }, []);

    return (
        <div>
            {/* We check if the member state is not null. If it's not null, we render a section. */}
            {member !== null && (
                <section
                    // When the section is clicked, we check if the user is logged in.
                    // If the user is logged in, we call the logout function.
                    // If the user is not logged in, we call the login function.
                    // onClick={() => (myWixClient.auth.loggedIn() ? logout() : login())}
                    onClick={handleLoginModal}
                    style={{
                        cursor: "pointer",
                    }}
                >
                    <h3>
                        {/* We display a greeting message. */}
                        Hello{" "}
                        {/* If the user is logged in, we display the user's nickname or slug, if they exist.
                          If neither exist, we display an empty string.
                          If the user is not logged in, we display "visitor". */}
                        {myWixClient.auth.loggedIn()
                            ? member.profile?.nickname || member.profile?.slug || ""
                            : "visitor"}
                        ,
                    </h3>
                    {/* We display a link that allows the user to login or logout.
                    The text of the link depends on whether the user is logged in or not. */}
                    <span>{myWixClient.auth.loggedIn() ? "Logout" : "Login"}</span>
                </section>
            )}
        </div>
    );
}
