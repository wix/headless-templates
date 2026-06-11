import Link from "next/link";
import {useEffect, useState} from "react";
import {createClient, OAuthStrategy} from "@wix/sdk";
import Cookies from "js-cookie";
import {CLIENT_ID} from "@/constants/constants";
import styles from "@/styles/app.module.css";
import {useClient} from "@/internal/providers/client-provider";

// Create the Wix client
const myWixClient = createClient({
    auth: OAuthStrategy({
        clientId: CLIENT_ID,
        tokens: JSON.parse(Cookies.get("session") || null),
    }),
});

/*
 * Examples component for displaying installed and uninstalled apps.
 *
 * This component fetches the list of examples and installed apps,
 * and displays them in separate sections based on their installation status.
 */
export default function Examples() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const {installedAppsList, installedExamples, uninstalledExamples} =
        useClient();

    useEffect(() => {
        setIsLoggedIn(myWixClient.auth.loggedIn());
    }, []);

    const appLabel = uninstalledExamples.length === 1 ? "Suggested App" : "Suggested Apps";
    const hasApps = uninstalledExamples.length > 0;

    return (
        <div>
            <div className={styles.grid}>
                {installedExamples.map((example) => {
                    // Check if the example is a subscription and if the user is logged in
                    const isSubscription = example.data.slug === "/subscriptions";
                    const isDisabled = isSubscription && !isLoggedIn;

                    return (
                        <Link
                            key={example._id}
                            href={isDisabled ? "#" : example.data.slug}
                            onClick={(e) => isDisabled && e.preventDefault()}
                        >
                            <section className={`${isDisabled ? styles.disabled : ""}`}>
                                <h2>
                                    {example.data.title} <span>-&gt;</span>
                                </h2>
                                <p>
                                    {!isDisabled ? example.data.description : "Login to view"}
                                </p>
                            </section>
                        </Link>
                    );
                })}
            </div>
            <div style={{ padding: "24px 0" }}>
                <label className={styles.row} style={{ paddingLeft: "1.2rem" }}>
                    {appLabel}
                </label>
                <hr />
            </div>
            <div className={styles.grid}>
                {uninstalledExamples.map((example) => {
                    if (installedAppsList.includes(example.data.orderId - 1)) {
                        return null;
                    }

                    return (
                        <Link
                            key={example._id}
                            href={example.installLink}
                            target={"_blank"}
                        >
                            <section>
                                <h2 className={`${styles.row} ${styles.start}`}>
                                    {example.data.title}
                                    <svg
                                        viewBox="0 0 30 30"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{flex: "0 0 30px", height: "30px", width: "30px"}}
                                    >
                                        <path
                                            d="M20.027 16.9318L18.5562 18.4026L18.6269 12.3922L10.3396 20.6795L9.32141 19.6613L17.6087 11.374L11.5983 11.4447L13.0691 9.97389L20.1684 9.83247L20.027 16.9318Z"
                                            fill="black"
                                        />
                                    </svg>
                                </h2>
                                <p>Install from the Wix App Market</p>
                            </section>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
