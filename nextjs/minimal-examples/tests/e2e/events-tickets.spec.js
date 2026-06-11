import {expect, test} from "@playwright/test";
import testIds from "../../src/utils/test-ids";
import {waitForWixSite} from "./utils/wix-checkout";

test.describe("Events Tickets Flow", () => {
    const PATH = "/tickets";

    test("Tickets e2e", async ({page}) => {
        await page.goto(PATH);

        await expect(
            await page.getByTestId(testIds.EVENTS_PAGE.CONTAINER),
        ).toBeVisible();

        await page.getByTestId(testIds.EVENTS_PAGE.EVENT).first().click();

        await page.getByTestId(testIds.EVENTS_PAGE.TICKET_OPTION).first().click();

        await waitForWixSite(page);

        await expect(await page.getByText("Add your details")).toBeVisible();
    });
});
