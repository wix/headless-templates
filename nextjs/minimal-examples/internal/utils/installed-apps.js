import {CLIENT_ID} from "@/constants/constants";
import {createClient, OAuthStrategy} from "@wix/sdk";
import {redirects} from "@wix/redirects";
import Cookies from "js-cookie";
import {availabilityCalendar, services} from "@wix/bookings";
import {products} from "@wix/stores";
import {currentCart} from "@wix/ecom";
import {plans} from "@wix/pricing-plans";
import {orders as checkout, wixEventsV2 as wixEvents} from "@wix/events";
import {jwtDecode} from "jwt-decode";

// Enum for Wix applications
export const WixApplications = Object.freeze({
    BOOKINGS: 0,
    STORE: 1,
    EVENTS: 2,
    SUBSCRIPTIONS: 3,
});

// Function to create a Wix client with specified modules and OAuth authentication
const createWixClient = () => {
    return createClient({
        modules: {
            services,
            availabilityCalendar,
            redirects,
            products,
            currentCart,
            plans,
            checkout,
            wixEvents,
        },
        auth: OAuthStrategy({
            clientId: CLIENT_ID,
            tokens: JSON.parse(Cookies.get("session") || "null"),
        }),
    });
};

// Function to check if an app is installed
const checkAppInstallation = async (queryFunction, appType) => {
    try {
        const result = await queryFunction();
        return result ? [appType] : [];
    } catch (error) {
        return [];
    }
};

// Function to check if the store app is installed
const checkStoresInstalled = async (myWixClient) => {
    try {
        const productList = await myWixClient.products.queryProducts().find();
        const product = productList.items[0];
        // First, we create an options object from the product's options.
        // We use the reduce function to transform the productOptions array into an object.
        const options = product.productOptions.reduce(
            (selected, option) => ({
                // For each option, we add a new property to the object with the option name as the key and the description of the first choice as the value.
                ...selected,
                [option.name]: option.choices[0].description,
            }),
            {}, // This is the initial value of the reduce function. It's an empty object that we'll add properties to.
        );

        // Then, we call the addToCurrentCart method from the currentCart module of the Wix client.
        // This method adds items to the current user's shopping cart.
        await myWixClient.currentCart.addToCurrentCart({
            // We pass an object that describes the product to be added.
            lineItems: [
                {
                    // Each product is identified by a catalogReference object.
                    catalogReference: {
                        appId: "1380b703-ce81-ff05-f115-39571d94dfcd", // This is the application ID of stores app.
                        catalogItemId: product._id, // This is the product's ID.
                        options: {options}, // These are the product options we created earlier.
                    },
                    quantity: 1, // We're adding one unit of the product.
                },
            ],
        });

        const cartHasItems = (await myWixClient.currentCart.getCurrentCart()).lineItems.length > 0;
        await myWixClient.currentCart.deleteCurrentCart();
        return cartHasItems;
    } catch (error) {
        return false;
    }
}

// Function to get the list of installed apps
export const installedApps = async () => {
    const myWixClient = createWixClient();

    const appChecks = [
        checkAppInstallation(
            () => myWixClient.services.queryServices().find(),
            WixApplications.BOOKINGS,
        ),
        checkAppInstallation(
            () => checkStoresInstalled(myWixClient),
            WixApplications.STORE,
        ),
        checkAppInstallation(
            () => myWixClient.wixEvents.queryEvents().find(),
            WixApplications.EVENTS,
        ),
        checkAppInstallation(
            () => myWixClient.plans.queryPublicPlans().find(),
            WixApplications.SUBSCRIPTIONS,
        ),
    ];

    // check if stores app is installed
    const results = await Promise.all(appChecks);
    return results.flat();
};

// Function to get the meta site ID
export const getMetaSiteId = async () => {
    const myWixClient = createWixClient();
    const session = Cookies.get("session");
    let tokens;
    if (!session) {
        tokens = await myWixClient.auth.generateVisitorTokens();
    } else {
        tokens = JSON.parse(session);
    }
    try {
        const {data} = jwtDecode(parseJwt(tokens?.accessToken?.value));
        const parsedData = JSON.parse(data);
        return parsedData.instance.metaSiteId;
    } catch (error) {
        console.error("Error getting meta site ID", error);
        return null;
    }
};

// Function to parse JWT token
const parseJwt = (token) => {
    return token.replace(/^OauthNG\.JWS\./, "");
};
