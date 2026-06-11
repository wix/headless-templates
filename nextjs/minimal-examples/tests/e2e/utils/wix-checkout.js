export const waitForWixSite = (page) =>
    page.waitForSelector("#SITE_CONTAINER", {timeout: 10000});
