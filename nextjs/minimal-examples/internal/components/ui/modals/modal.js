import React, {useCallback, useEffect, useState} from "react";
import styles from "@/styles/modal.module.css";

const Modal = ({children, isOpen, onClose}) => {
    const [isModalOpen, setIsModalOpen] = useState(isOpen);

    useEffect(() => {
        setIsModalOpen(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        onClose && onClose();
    }, [onClose]);

    if (!isModalOpen) return null;

    return (
        <>
            <div className={styles["modal-overlay"]}></div>
            <div className={styles["modal-container"]}>
                <div className={styles["modal-content-wrapper"]}>
                    <div className={styles["modal-content"]}>
                        <button
                            className={styles["modal-close-button"]}
                            onClick={handleClose}
                        >
                            <svg width="31" height="30" viewBox="0 0 31 30" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_2832_155538)">
                                    <g clipPath="url(#clip1_2832_155538)">
                                        <path
                                            d="M20.3 9L15.5 13.8L10.7 9L9.65 10.05L14.45 15L9.5 19.95L10.55 21L15.5 16.05L20.45 21L21.5 19.95L16.55 15L21.35 10.05L20.3 9Z"
                                            fill="#000624"/>
                                    </g>
                                </g>
                                <defs>
                                    <clipPath id="clip0_2832_155538">
                                        <rect width="30" height="30" fill="white" transform="translate(0.5)"/>
                                    </clipPath>
                                    <clipPath id="clip1_2832_155538">
                                        <rect width="12" height="12" fill="white" transform="translate(9.5 9)"/>
                                    </clipPath>
                                </defs>
                            </svg>

                        </button>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

const Header = ({children}) => (
    <div className={styles["modal-header"]}>{children}</div>
);

const Body = ({children}) => (
    <div className={styles["modal-body"]}>{children}</div>
);

const Footer = ({children}) => (
    <div className={styles["modal-footer"]}>{children}</div>
);

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
