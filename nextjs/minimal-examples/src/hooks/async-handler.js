import {useCallback} from "react";
import {useLoading} from "@/src/context/loading-context";

/*
 * Custom hook to handle asynchronous operations with loading state management.
 *
 * This hook provides a function that wraps an asynchronous function, managing
 * the loading state before and after the async operation.
 *
 */
export function useAsyncHandler() {
    const {startLoading, stopLoading} = useLoading();

    return useCallback(
        /*
         * Executes an asynchronous function with loading state management.
         */
        async (asyncFunc) => {
            startLoading();
            try {
                return await asyncFunc();
            } catch (error) {
                console.error("Error:", error);
                throw error;
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading],
    );
}
