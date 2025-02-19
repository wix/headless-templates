import {expect, test} from "@playwright/test";
import testIds from "../../src/utils/test-ids";
import {waitForWixSite} from "./utils/wix-checkout";

test.describe("Pricing Plans Flow", () => {
    const PATH = "/subscriptions";

    test("Subscriptions e2e", async ({page}) => {
        await page.goto(PATH);

        await expect(
            await page.getByTestId(testIds.SUBSCRIPTIONS_PAGE.CONTAINER),
        ).toBeVisible();

        await page
            .getByTestId(testIds.SUBSCRIPTIONS_PAGE.PRICING_PLAN)
            .first()
            .click();

        await waitForWixSite(page);

        await expect(await page.getByText("Order summary")).toBeVisible();
    });
});
