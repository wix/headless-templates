import {expect, test} from "@playwright/test";
import testIds from "../../src/utils/test-ids";
import {waitForWixSite} from "./utils/wix-checkout";

test.describe("Bookings Flow", () => {
    const PATH = "/booking";

    test("Bookings e2e", async ({page}) => {
        await page.goto(PATH);

        await expect(
            await page.getByTestId(testIds.BOOKINGS_PAGE.CONTAINER),
        ).toBeVisible();

        await page.getByTestId(testIds.BOOKINGS_PAGE.SERVICE).first().click();

        await page.getByTestId(testIds.BOOKINGS_PAGE.SLOT).first().click();

        await waitForWixSite(page);

        await expect(await page.getByText("Booking Details")).toBeVisible();
    });
});
