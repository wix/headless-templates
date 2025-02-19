import React, {createContext, useContext, useEffect, useState} from "react";
import Link from "next/link";
import Toast from "@/internal/components/ui/toast";

// Create a context for the toast
const ToastContext = createContext(null);

// Provider component to manage the toast
export function ToastProvider({children}) {
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
        setMounted(false);
    }, []);

    return (
        <ToastContext.Provider value={mounted}>
            <Toast>
                Replace the CLIENT_ID in the <span style={{fontWeight: "bold"}}>constants/constants.js</span> file. You
                can copy the Client ID from
                your Headless project settings. {" "}
                <Link
                    href={
                        "https://dev.wix.com/docs/go-headless/getting-started/setup/authentication/create-an-oauth-app-for-visitors-and-members"
                    }
                    target={"_blank"}
                    style={{color: "#116DFF"}}
                >
                    Learn more
                </Link>

            </Toast>
            {children}
        </ToastContext.Provider>
    );
}

// Custom hook to use the client context
export function useClient() {
    const context = useContext(ToastContext);
    if (context === null) {
        throw new Error("useClient must be used within a ClientProvider");
    }
    return context;
}
