import {CLIENT_ID} from "@/constants/constants";
import Cookies from "js-cookie";

export const checkClientIdAndRemoveSessionIfChanged = () => {
    // Get the stored CLIENT_ID from localStorage
    const storedClientId = localStorage.getItem("storedClientId");

    // If there's no stored CLIENT_ID, store the current one and return
    if (!storedClientId) {
        localStorage.setItem("storedClientId", CLIENT_ID);
        return;
    }

    // Check if the stored CLIENT_ID is different from the current one
    if (storedClientId !== CLIENT_ID) {
        // CLIENT_ID has changed, remove the session cookie
        Cookies.remove("session");

        // Update the stored CLIENT_ID
        localStorage.setItem("storedClientId", CLIENT_ID);
    }
};
