import {createContext, useContext, useEffect, useState} from "react";
import {getMetaSiteId, installedApps} from "@/internal/utils/installed-apps";
import {useAsyncHandler} from "@/src/hooks/async-handler";

// Create a context for the client
const ClientContext = createContext(null);

// Provider component to manage the client
export function ClientProvider({children}) {
    const [msid, setMsid] = useState(null);
    const [installedAppsList, setInstalledAppsList] = useState([]);
    const [installedExamples, setInstalledExamples] = useState([]);
    const [uninstalledExamples, setUninstalledExamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const handleAsync = useAsyncHandler();

    useEffect(() => {
        const fetchData = async () => {
            try {
                await handleAsync(async () => {
                    const fetchedMsid = await getMetaSiteId();
                    const fetchedInstalledApps = await installedApps();
                    setMsid(fetchedMsid);
                    setInstalledAppsList(fetchedInstalledApps);

                    const fetchedExamples = await fetch("/examples.json").then((res) =>
                        res.json(),
                    );

                    // skip subscription example in phase1
                    const subscriptionExampleIndex = fetchedExamples.findIndex(
                        (example) => example.data.slug === "/subscriptions",
                    );
                    delete fetchedExamples[subscriptionExampleIndex];

                    setInstalledExamples(
                        fetchedExamples.filter((example) =>
                            fetchedInstalledApps.includes(example.data.orderId - 1),
                        ),
                    );

                    setUninstalledExamples(
                        fetchedExamples.filter(
                            (example) =>
                                !fetchedInstalledApps.includes(example.data.orderId - 1),
                        ),
                    );
                });
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <ClientContext.Provider
            value={{
                msid,
                installedAppsList,
                installedExamples,
                uninstalledExamples,
                loading,
            }}
        >
            {children}
        </ClientContext.Provider>
    );
}

// Custom hook to use the client context
export function useClient() {
    const context = useContext(ClientContext);
    if (context === null) {
        throw new Error("useClient must be used within a ClientProvider");
    }
    return context;
}
