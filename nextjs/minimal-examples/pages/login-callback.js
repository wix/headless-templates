import Cookies from "js-cookie";
import {useEffect, useState} from "react";
import {createClient, OAuthStrategy} from "@wix/sdk";
import {CLIENT_ID} from "@/constants/constants";

// We're creating a Wix client using the createClient function from the Wix SDK.
const myWixClient = createClient({
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

export default function LoginCallback() {
    // State variables to store the next page and error message.
    const [nextPage, setNextPage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // This function verifies the login process.
    async function verifyLogin() {
        // We retrieve the OAuth data from the local storage.
        // This data was stored there during the login process.
        const data = JSON.parse(localStorage.getItem("oauthRedirectData"));

        // We remove the OAuth data from the local storage.
        localStorage.removeItem("oauthRedirectData");

        try {
            // We parse the code and state from the URL.
            // These values were appended to the URL by the Wix platform during the OAuth process.
            const {code, state} = myWixClient.auth.parseFromUrl();

            // We call the getMemberTokens method from the auth module of the Wix client.
            // This method exchanges the code and state for a set of tokens.
            // These tokens are used to authenticate the user.
            const tokens = await myWixClient.auth.getMemberTokens(code, state, data);

            // We store the tokens in a cookie named "session".
            Cookies.set("session", JSON.stringify(tokens));

            // Finally, we redirect the user to the original page they were on before the login process started.
            // If the original page URL doesn't exist, we default to the home page ("/").
            window.location = data?.originalUri || "/";
        } catch (e) {
            // If an error occurs during the process, we update the state of the next page and error message in the React component.
            setNextPage(data?.originalUri || "/");
            console.error("Error verifying login:", e);
            setErrorMessage(e.toString());
        }
    }

    // Verify the login when the component mounts.
    useEffect(() => {
        verifyLogin();
    }, []);

    return (
        <article>
            {/* We check if there's an error message. If there is, we display it. */}
            {errorMessage && (
                <>
                    <span>{errorMessage}</span>
                    <br/>
                    <br/>
                </>
            )}
            {/* We check if there's a nextPage. If there is, we display a link to it.
            If there isn't, we display a loading message. */}
            {nextPage ? <a href={nextPage}>Continue</a> : <>Loading...</>}
        </article>
    );
}
