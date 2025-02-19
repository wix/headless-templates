import {createContext, useCallback, useContext, useState} from "react";

// Create a providers for loading state management
const LoadingContext = createContext();

// Provider component to manage loading state
export function LoadingProvider({children}) {

    const [loadingCount, setLoadingCount] = useState(0);

    // Function to increment loading count
    const startLoading = useCallback(
        () => setLoadingCount((count) => count + 1),
        [],
    );

    // Function to decrement loading count
    const stopLoading = useCallback(
        () => setLoadingCount((count) => count - 1),
        [],
    );

    return (
        <LoadingContext.Provider
            value={{isLoading: loadingCount > 0, startLoading, stopLoading}}
        >
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return useContext(LoadingContext);
}
