import {useLoading} from "@/src/context/loading-context";
import styles from "@/styles/app.module.css";

export function GlobalLoader() {
    const {isLoading} = useLoading();

    return (
        isLoading && (
            <div className={styles["global-loader"]}>
                <div className={styles.loader}></div>
            </div>
        )
    );
}
