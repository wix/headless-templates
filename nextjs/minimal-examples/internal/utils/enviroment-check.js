// Usage: Check if the current environment is a sandbox environment and show a modal to inform the user

import {CLIENT_ID} from "@/constants/constants";

export function checkSandboxEnvironment() {
    const url = window.location.hostname;
    const csbUrlType = /^[a-zA-Z0-9]+-\d+\.csb\.app$/;

    return csbUrlType.test(url) && !localStorage.getItem("sandboxInfoModal");
}

export function checkDefaultClientId() {
    return CLIENT_ID === "9e37d7b0-3621-418f-a6b6-b82bdeaf051d";
}
