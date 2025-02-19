import {useRouter} from "next/router";
import {CLIENT_ID} from "@/constants/constants";
import Link from "next/link";
import styles from "@/styles/app.module.css";

/*
 * Custom 404 page component for handling app not installed errors.
 *
 * This component displays a message indicating that the requested app is not installed
 * for the given client ID and provides a link to go back to the homepage.
 *
 */

export default function Custom404() {
    const router = useRouter();
    const {app} = router.query;

    return (
        <div>
            <h1>404 - App Not Installed</h1>
            <p>
                {app || "The requested app"} is not installed for client ID: {CLIENT_ID}
            </p>
            <p>Please install the app in your Wix dashboard and try again.</p>
            <Link href={"/"}>
                <section
                    className={styles.selectable}
                    style={{
                        color: "#0070f3",
                        textDecoration: "underline",
                        width: "fit-content",
                        margin: "20px auto",
                    }}
                >
                    <h4>
                        Go back to homepage <span>-&gt;</span>
                    </h4>
                </section>
            </Link>
        </div>
    );
}
