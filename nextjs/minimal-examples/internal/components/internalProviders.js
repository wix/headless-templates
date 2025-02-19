import React from "react";
import {ClientProvider} from "@/internal/providers/client-provider";
import {ModalProvider} from "@/internal/providers/modal-provider";
import {ToastProvider} from "@/internal/providers/toast-provider";

/**
 * Internal providers for the Wix Headless Examples application.
 *
 * This component wraps the application with the internal providers for the application.
 * There is no need to wrap the application with these providers in a real-world application.
 * This is only necessary for the Wix Headless Examples application to provide the necessary
 * context for the application. In a real-world application, you would only need to wrap the
 * application with the necessary providers for your application.
 */

const InternalProviders = ({children}) => {
    return (
        <ClientProvider>
            <ToastProvider>
                <ModalProvider>{children}</ModalProvider>
            </ToastProvider>
        </ClientProvider>
    );
};

export default InternalProviders;
