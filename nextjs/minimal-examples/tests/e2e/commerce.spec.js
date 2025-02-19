import {expect, test} from "@playwright/test";
import testIds from "../../src/utils/test-ids";
import {waitForWixSite} from "./utils/wix-checkout";

test.describe("eCommerce Flow", () => {
    const PATH = "/store";

    test("eCommerce e2e", async ({page}) => {
        await page.goto(PATH);

        // Verify that the store container is visible
        await expect(
            page.getByTestId(testIds.COMMERCE_PAGE.CONTAINER),
        ).toBeVisible();

        // Check if the product list is visible and clickable
        const firstProduct = page
            .getByTestId(testIds.COMMERCE_PAGE.PRODUCT)
            .first();
        await expect(firstProduct).toBeVisible();
        const productName = await firstProduct.textContent();

        // Click on the first product to add it to the cart
        await firstProduct.click();

        // Click on the checkout button
        const checkoutButton = page
            .getByTestId(testIds.COMMERCE_PAGE.CHECKOUT)
            .first();
        await expect(checkoutButton).toBeVisible();
        await checkoutButton.click();

        // Wait for the Wix checkout iframe to load
        await waitForWixSite(page);

        // Verify the iframe is present and switch context if necessary
        const checkoutIframeSelector = 'iframe[title="Checkout"]';
        const isCheckoutIframe =
            (await page.locator(checkoutIframeSelector).count()) > 0;

        const frame = isCheckoutIframe
            ? page.frameLocator(checkoutIframeSelector)
            : page;
        await expect(frame.getByText(productName)).toBeVisible();
    });
});
