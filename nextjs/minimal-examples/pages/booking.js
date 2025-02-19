import Cookies from "js-cookie";
import {useEffect, useState} from "react";

import {createClient, OAuthStrategy} from "@wix/sdk";
import {availabilityCalendar, services} from "@wix/bookings";
import {redirects} from "@wix/redirects";
import testIds from "@/src/utils/test-ids";
import {CLIENT_ID} from "@/constants/constants";
import Link from "next/link";
import Head from "next/head";
import styles from "@/styles/app.module.css";
import {useAsyncHandler} from "@/src/hooks/async-handler";
import {useClient} from "@/internal/providers/client-provider";

// We're creating a Wix client using the createClient function from the Wix SDK.
const myWixClient = createClient({
    // We specify the modules we want to use with the client.
    // In this case, we're using the services, availabilityCalendar, and redirects modules.
    modules: {services, availabilityCalendar, redirects},

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

export default function Booking() {
    // State variables for service list and availability entries
    const [serviceList, setServiceList] = useState([]);
    const [availabilityEntries, setAvailabilityEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chosenService, setChosenService] = useState(null);
    const [chosenSlot, setChosenSlot] = useState(null);
    const handleAsync = useAsyncHandler();
    const {msid} = useClient();

    // This is function fetches the list of services.
    async function fetchServices() {
        setIsLoading(true);
        try {
            await handleAsync(async () => {
                // We call the queryServices method from the services module of the Wix client.
                // This method retrieves the list of services.
                const serviceList = await myWixClient.services.queryServices().find();

                // Then, we update the state of the service list in the React component.
                setServiceList(serviceList.items);
            });
        } catch (error) {
            console.error("Error fetching services", error);
        } finally {
            setIsLoading(false);
        }
    }

    // This is function fetches the availability of a service.
    async function fetchAvailability(service) {
        await handleAsync(async () => {
            // We create two Date objects for today and tomorrow.
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // We call the queryAvailability method from the availabilityCalendar module of the Wix client.
            // This method retrieves the availability of a service.
            const availability =
                await myWixClient.availabilityCalendar.queryAvailability(
                    {
                        filter: {
                            serviceId: [service._id], // We filter by the service ID.
                            startDate: today.toISOString(), // We set the start date to be today.
                            endDate: tomorrow.toISOString(), // We set the end date to be tomorrow.
                        },
                    },
                    {timezone: "UTC"}, // We set the timezone to be UTC.
                ); // the response contains the availability entries for the service within the specified time range.

            // Then, we update the state of the availability entries in the React component.
            setAvailabilityEntries(availability.availabilityEntries);
            setChosenService(service._id);
        });
    }

    // This is function creates a redirect to the checkout page.
    async function createRedirect(slotAvailability) {
        await handleAsync(async () => {
            // We call the createRedirectSession method from the redirects module of the Wix client.
            // This method creates a redirect session to the checkout page.
            const redirect = await myWixClient.redirects.createRedirectSession({
                // We pass an object that specifies the slotAvailability for the bookingsCheckout.
                bookingsCheckout: {slotAvailability, timezone: "UTC"},
                // We also specify the postFlowUrl to be the current page URL. This is where the user will be redirected after the checkout flow.
                callbacks: {postFlowUrl: window.location.href},
            });

            // Finally, we redirect the user to the URL generated by the redirect session.
            window.location = redirect.redirectSession.fullUrl;

            // We also update the state of the chosen slot in the React component.
            setChosenSlot(slotAvailability);
        });
    }

    // Fetch services on component mount
    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <>
            <Head>
                <title>Booking Page</title>
            </Head>

            <main data-testid={testIds.BOOKINGS_PAGE.CONTAINER}>
                <div>
                    <h2>Choose a Service:</h2>
                    {isLoading ? (
                        <p>Loading services...</p>
                    ) : serviceList.length > 0 ? (
                        serviceList.map((service) => {
                            return (
                                // Each service is displayed in a section. When clicked, the availability of the service is fetched.
                                <section
                                    key={service._id}
                                    data-testid={testIds.BOOKINGS_PAGE.SERVICE}
                                    onClick={() => fetchAvailability(service)}
                                    className={`${styles.selectable} ${chosenService === service._id ? styles.active : ""}`}
                                >
                                    {service.name}
                                </section>
                            );
                        })
                    ) : (
                        <div>
                            <p>No services available</p>
                            <Link
                                href={`https://manage.wix.com/dashboard/${msid}/bookings`}
                                rel="noopener noreferrer"
                                target="_blank"
                                style={{textDecoration: "underline", color: "#0070f3"}}
                            >
                                Create a service
                            </Link>
                        </div>
                    )}
                </div>
                <div>
                    <h2>Choose a Slot:</h2>
                    {/* Mapping through availability entries and displaying each slot */}
                    {availabilityEntries.map((entry) => {
                        return (
                            // Each slot is displayed in a section. When clicked, a redirect to the checkout page is created.
                            <section
                                key={entry.slot.startDate}
                                data-testid={testIds.BOOKINGS_PAGE.SLOT}
                                onClick={() => createRedirect(entry)}
                                className={`${styles.selectable} ${chosenSlot === entry ? styles.active : ""}`}
                            >
                                {new Date(entry.slot.startDate).toLocaleString()}
                            </section>
                        );
                    })}
                </div>
            </main>
        </>
    );
}

export async function getStaticProps() {
    return {
        props: {
            title: "Bookings",
        },
    };
}
