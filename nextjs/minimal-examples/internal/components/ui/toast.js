"use client";
import {useEffect, useState} from "react";
import styles from "@/styles/app.module.css";
import {checkDefaultClientId} from "@/internal/utils/enviroment-check";

export default function Toast({children}) {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const toastClosed = localStorage.getItem("toastClosed");

        if (toastClosed === null && checkDefaultClientId()) {
            setShowToast(true);
        } else {
            setShowToast(false);

            localStorage.removeItem("toastClosed");
        }

        return () => {
            localStorage.removeItem("toastClosed");
        };
    }, []);

    const closeToast = () => {
        setShowToast(false);
        localStorage.setItem("toastClosed", "true");
    };

    if (!showToast) return null;

    return (
        <div className={`${styles.toast}`}>
            <div className={`${styles["toast-icon-wrapper"]}`}>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${styles["toast-icon"]}`}
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9 16C5.13401 16 2 12.866 2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9C16 12.866 12.866 16 9 16ZM9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15ZM8 8H10V12L11 13H7L8 12V8.85714H7L8 8ZM9 5C9.55228 5 10 5.44772 10 6C10 6.55228 9.55228 7 9 7C8.44772 7 8 6.55228 8 6C8 5.44772 8.44772 5 9 5Z"
                        fill="#000624"
                    />
                </svg>
            </div>
            <div className={styles.column}>
                <h4>Add your Client ID to get started</h4>
                <span className={`${styles["toast-content"]}`}>{children}</span>
            </div>
            <button
                onClick={closeToast}
                className={`${styles["toast-close"]}`}
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
}
