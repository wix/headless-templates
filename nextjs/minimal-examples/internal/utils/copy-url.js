export const copyUrl = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
        console.error("Failed to copy the URL: ", err);
    }
};
