"use client";

import React from "react";
import Modal from "@/internal/components/ui/modals/modal";
import {useModal} from "@/internal/providers/modal-provider";
import styles from "@/styles/premium-modal.module.css";

export const PremiumModal = () => {
    const {modalState, closeModal} = useModal();
    const {isOpen, props} = modalState.premium;

    return (
        <Modal isOpen={isOpen} onClose={() => closeModal("premium")}>
            <Modal.Body>
                <div className={styles["container"]}>
                    <div className={styles["modal"]}>
                        <h1 className={styles["title"]}>Upgrade this site to accept payments online</h1>
                        <p className={styles["content"]}>To start getting paid online, upgrade your site with a premium
                            that
                            allows you to see
                            the full payment flow</p>
                        <button className={styles["upgrade-button"]} onClick={props?.primaryAction}>Upgrade Now</button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
