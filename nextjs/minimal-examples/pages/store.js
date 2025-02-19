import Cookies from "js-cookie";
import {useEffect, useState} from "react";

import {createClient, OAuthStrategy} from "@wix/sdk";
import {products} from "@wix/stores";
import {currentCart} from "@wix/ecom";
import {redirects} from "@wix/redirects";
import testIds from "@/src/utils/test-ids";
import {CLIENT_ID} from "@/constants/constants";
import Link from "next/link";
import Head from "next/head";
import styles from "@/styles/app.module.css";
import {useAsyncHandler} from "@/src/hooks/async-handler";
import {useClient} from "@/internal/providers/client-provider";
import {useModal} from "@/internal/providers/modal-provider";

// We're creating a Wix client using the createClient function from the Wix SDK.
const myWixClient = createClient({
    // We specify the modules we want to use with the client.
    // In this case, we're using the products, currentCart, and redirects modules.
    modules: {products, currentCart, redirects},

    // We're using the OAuthStrategy for authentication.
    // This strategy requires a client ID and a set of tokens.
    auth: OAuthStrategy({
        // The client ID is a unique identifier for the application.
        // It's used to authenticate the application with the Wix platform.
        clientId: CLIENT_ID,

        // The tokens are used to authenticate the user.
        // In this case, we're getting the tokens from a cookie named "session".
        // If the cookie doesn't exist, we default to null.
        tokens: JSON.parse(Cookies.get("session") || null),
    }),
});

export default function Store() {
    // State variables for product list and cart
    const [productList, setProductList] = useState([]);
    const [cart, setCart] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const handleAsync = useAsyncHandler();
    const {msid} = useClient();
    const {openModal} = useModal();

    // This function fetches the list of products
    async function fetchProducts() {
        setIsLoading(true);
        try {
            await handleAsync(async () => {
                // Querying products and setting the product list state variable
                const productList = await myWixClient.products.queryProducts().find();
                setProductList(productList.items);
            });
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setIsLoading(false);
        }
    }

    // This function fetches the current cart
    async function fetchCart() {
        // try-catch block to handle errors if the cart is not available
        try {
            // We call the getCurrentCart method from the currentCart module of the Wix client.
            // This method retrieves the current user's shopping cart.
            await handleAsync(async () =>
                setCart(await myWixClient.currentCart.getCurrentCart()),
            );
        } catch {
            // If the cart is not available, do something (e.g., show an error message)
        }
    }

    // This function adds a product to the cart using the currentCart module of the Wix client created
    async function addToCart(product) {
        await handleAsync(async () => {
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

            // Check if the product is already in the cart
            if (cart) {
                const existingProduct = cart?.lineItems?.find(
                    (item) => item.catalogReference.catalogItemId === product._id,
                );

                // If the product is already in the cart, increase the quantity
                if (existingProduct) {
                    return addExistingProduct(
                        existingProduct._id,
                        existingProduct.quantity + 1,
                    );
                }
            }

            // Then, we call the addToCurrentCart method from the currentCart module of the Wix client.
            // This method adds items to the current user's shopping cart.
            const {cart: returnedCard} =
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

            // Finally, we update the state of the cart in the React component.
            setCart(returnedCard);
        });
    }

    // This is a function that clears the cart.
    async function clearCart() {
        await handleAsync(async () => {
            // We call the deleteCurrentCart method from the currentCart module of the Wix client.
            // This method deletes the current site visitor's shopping cart.
            await myWixClient.currentCart.deleteCurrentCart();

            // Then, we update the state of the cart in the React component to be an empty object.
            setCart({});
        });
    }

    // This is a function that creates a redirect to the checkout page.
    async function createRedirect() {
        try {
            await handleAsync(async () => {
                // We call the createCheckoutFromCurrentCart method from the currentCart module of the Wix client.
                // This method creates a checkout from the current user's shopping cart.
                const {checkoutId} =
                    await myWixClient.currentCart.createCheckoutFromCurrentCart({
                        // We specify the channel type to be WEB.
                        channelType: currentCart.ChannelType.WEB,
                    });

                // Then, we call the createRedirectSession method from the redirects module of the Wix client.
                // This method creates a redirect session to the checkout page.
                const redirect = await myWixClient.redirects.createRedirectSession({
                    // We pass an object that specifies the checkoutId for the ecomCheckout.
                    ecomCheckout: {checkoutId},
                    // We also specify the postFlowUrl to be the current page URL. This is where the user will be redirected after the checkout flow.
                    callbacks: {postFlowUrl: window.location.href},
                });

                // Finally, we redirect the user to the URL generated by the redirect session.
                window.location = redirect.redirectSession.fullUrl;
            });
        } catch (error) {
            openModal("premium", {
                primaryAction: () => {
                    window.open(
                        `https://manage.wix.com/premium-purchase-plan/dynamo?siteGuid=${msid || ""}`,
                        "_blank"
                    );
                },
            });
        }
    }

    async function addExistingProduct(lineItemId, quantity) {
        const {cart} =
            await myWixClient.currentCart.updateCurrentCartLineItemQuantity([
                {
                    _id: lineItemId,
                    quantity,
                },
            ]);

        // Finally, we update the state of the cart in the React component.
        setCart(cart);
    }

    // Fetch products and cart on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch cart on component mount
    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <>
            <Head>
                <title>Ecommerce Page</title>
            </Head>

            <main data-testid={testIds.COMMERCE_PAGE.CONTAINER}>
                <div>
                    <h2>Choose Products:</h2>
                    {isLoading ? (
                        <p>Loading products...</p>
                    ) : productList.length > 0 ? (
                        productList.map((product) => {
                            return (
                                // Each product is displayed in a section. When clicked, the product is added to the cart.
                                <section
                                    data-testid={testIds.COMMERCE_PAGE.PRODUCT}
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className={styles.selectable}
                                >
                                    <span className={styles.fullWidth}>{product.name}</span>
                                    <span style={{width: "100px", textAlign: "right"}}>
                    {product.convertedPriceData.formatted.discountedPrice}
                  </span>
                                </section>
                            );
                        })
                    ) : (
                        <div>
                            <p>No products available</p>
                            <Link
                                href={`https://manage.wix.com/dashboard/${msid}/products`}
                                rel="noopener noreferrer"
                                target="_blank"
                                style={{textDecoration: "underline", color: "#0070f3"}}
                            >
                                Add a product
                            </Link>
                        </div>
                    )}
                </div>
                <div>
                    <h2>My Cart:</h2>
                    {/* If there are items in the cart, display the checkout and clear cart options */}
                    {cart.lineItems?.length > 0 && (
                        <div className={styles.column}>
                            {/* When clicked, the user is redirected to the checkout page */}
                            <section
                                className={`${styles.column} ${styles.start} ${styles.active}`}
                                style={{
                                    gap: "24px",
                                    borderColor: "rgba(var(--card-border-rgb), 0.15)",
                                }}
                            >
                                <li>
                                    {cart.lineItems.map((item, index) => (
                                        <ul key={index}>
                                            <div style={{display: "flex", gap: "16px"}}>
                                                <div style={{fontWeight: "bold"}}>
                                                    {item.quantity}
                                                </div>
                                                <div className={styles.fullWidth}>
                                                    {item.productName.original}
                                                </div>
                                            </div>
                                        </ul>
                                    ))}
                                </li>
                                <h3>Total {cart.subtotal.formattedAmount}</h3>
                            </section>
                            <button
                                className={styles.primary}
                                onClick={() => createRedirect()}
                                style={{fontWeight: "bold"}}
                                data-testid={testIds.COMMERCE_PAGE.CHECKOUT}
                            >
                                <div>Checkout</div>
                            </button>
                            {/* When clicked, the cart will be cleared */}
                            <button onClick={() => clearCart()} className={styles.secondary}>
                                <span>Clear cart</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export async function getStaticProps() {
    return {
        props: {
            title: "Ecommerce",
        },
    };
}
