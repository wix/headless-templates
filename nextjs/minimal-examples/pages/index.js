import styles from "@/styles/app.module.css";
import Examples from "@/pages/content";

export default function Home() {
    return (
        <>
            <article className={styles.row}>
                <h1 className={styles.fullWidth}>
                    Quick start with Next.js for Wix Headless
                </h1>
                <div className={`${styles.column} ${styles.start}`}>
          <span>
            This is an example site to demonstrate how to use Wix&apos;s
            business solution APIs headless. Click each example to see how it
            works.
          </span>
                    <span>
            <a href="https://dev.wix.com/api/sdk/about-wix-headless/overview">
              Documentation
            </a>{" "}
                        &nbsp;|&nbsp;
                        <a href="https://github.com/wix-incubator/wix-headless-example">
              Repo
            </a>
          </span>
                </div>
            </article>
            <Examples/>
        </>
    );
}
