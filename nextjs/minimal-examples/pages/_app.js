import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {Inter} from "next/font/google";

import "@/styles/globals.css";
import styles from "@/styles/app.module.css";
import React, {useEffect} from "react";
import {PageTitle} from "@/internal/components/ui/page-title";
import {GlobalLoader} from "@/src/components/global-loader";
import {LoginModal} from "@/internal/components/ui/modals/login-modal";
import {PremiumModal} from "@/internal/components/ui/modals/premium-modal";
import {checkClientIdAndRemoveSessionIfChanged} from "@/internal/utils/check-client-id-change";
import InternalProviders from "@/internal/components/internalProviders";
import {LoadingProvider} from "@/src/context/loading-context";

const inter = Inter({subsets: ["latin"]});

/*
 * Main App component for the Wix Headless Examples application.
 *
 * This component sets up the global providers providers, handles client ID checks,
 * and renders the main layout including the header, and the current page component.
 */
export default function App({Component, pageProps}) {
    // INTERNAL: Check if the client ID has changed and remove the session cookie if it has
    useEffect(() => {
        checkClientIdAndRemoveSessionIfChanged();
    }, []);

    return (
        <>
            <Head>
                <title>Wix Headless Examples</title>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <div className={`${styles.main} ${inter.className}`}>
                <LoadingProvider>
                    <InternalProviders>
                        <div className={styles.content}>
                            <header>
                                <Link href="/">
                                    <Image
                                        src="/wix.svg"
                                        alt="Wix Logo"
                                        width={88}
                                        height={34}
                                        priority
                                    />
                                </Link>
                                {/*Hide login in phase1*/}
                                {/*<LoginBar/>*/}
                            </header>
                            {pageProps.title && (
                                <PageTitle title={pageProps.title} withBackButton={true}/>
                            )}
                            <GlobalLoader/>
                            <Component {...pageProps} />
                        </div>
                        <LoginModal/>
                        <PremiumModal/>
                    </InternalProviders>
                </LoadingProvider>
            </div>
        </>
    );
}
