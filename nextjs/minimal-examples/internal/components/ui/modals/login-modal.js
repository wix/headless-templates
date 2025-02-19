import React, {useEffect, useState} from "react";
import Modal from "@/internal/components/ui/modals/modal";
import styles from "@/styles/modal.module.css";
import {useModal} from "@/internal/providers/modal-provider";
import Link from "next/link";
import {CLIENT_ID} from "@/constants/constants";
import {useClient} from "@/internal/providers/client-provider";
import {copyUrl} from "@/internal/utils/copy-url";

export const LoginModal = () => {
    const {modalState, closeModal} = useModal();
    const {isOpen} = modalState.login;
    const [url, setUrl] = useState("");
    const {msid, loading} = useClient();

    const handleClose = () => {
        closeModal("login");
        localStorage.setItem("sandboxInfoModal", "true");
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUrl(window.location.href);
        }
    }, []);

    if (loading) {
        return null; // or return a loading spinner
    }

    return (
        <Modal isOpen={isOpen} onClose={() => closeModal("login")}>
            <Modal.Header>
                <h3>CodeSandbox Environment Detected</h3>
            </Modal.Header>
            <Modal.Body>
                <>
                    <p>
                        We&rsquo;ve detected that you&rsquo;re running the app in the
                        CodeSandbox environment.
                        <br/>
                        In order to experience the full functionality of the Wix Login
                        Method,
                        <br/>
                        If you running your own client-id please add the generated URL that
                        CodeSandbox provides (
                        <span
                            onClick={copyUrl}
                            style={{
                                color: "#116DFF",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5em",
                            }}
                        >
              {url}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                style={{
                                    width: "1em",
                                    height: "1em",
                                    verticalAlign: "middle",
                                    fill: "#116DFF",
                                }}
                            >
                <path
                    d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/>
              </svg>
            </span>
                        ) to the OAuth App settings.
                        {msid && (
                            <Link
                                href={`https://manage.wix.com/dashboard/${msid}/oauth-apps-settings/manage/${CLIENT_ID}`}
                                target="_blank"
                                style={{color: "#116DFF"}}
                            >
                                (OAuth Redirect URL)
                            </Link>
                        )}
                    </p>
                    <br/>
                    <p>
                        Alternatively, if you didn&rsquo;t provide your own client-id, you
                        can test this feature from the{" "}
                        <Link
                            href="https://wix-headless-example.vercel.app/"
                            target="_blank"
                            style={{color: "#116DFF"}}
                        >
                            deployed version of the app
                        </Link>
                    </p>
                </>
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={handleClose}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    style={{margin: 0}}
                >
                    Don&apos;t show again
                </button>
            </Modal.Footer>
        </Modal>
    );
};
