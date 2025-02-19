import Cookies from "js-cookie";
import {useEffect, useState} from "react";

import {createClient, OAuthStrategy} from "@wix/sdk";
import {orders as checkout, wixEventsV2 as wixEvents} from "@wix/events";
import {redirects} from "@wix/redirects";
import testIds from "@/src/utils/test-ids";
import {CLIENT_ID} from "@/constants/constants";
import Link from "next/link";
import styles from "@/styles/app.module.css";
import Head from "next/head";
import {useAsyncHandler} from "@/src/hooks/async-handler";
import {useClient} from "@/internal/providers/client-provider";
import {useModal} from "@/internal/providers/modal-provider";

// We're creating a Wix client using the createClient function from the Wix SDK.
const myWixClient = createClient({
    // We specify the modules we want to use with the client.
    // In this case, we're using the wixEvents, checkout, and redirects modules.
    modules: {wixEvents, checkout, redirects},

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

export default function Tickets() {
    // State variables for events list and tickets availability
    const [eventsList, setEventsList] = useState([]);
    const [ticketsAvailability, setTicketsAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const handleAsync = useAsyncHandler();
    const {msid} = useClient();
    const {openModal} = useModal();

    // This is function fetches a list of events.
    async function fetchEvents() {
        setIsLoading(true);
        try {
            await handleAsync(async () => {
                // We call the queryEvents method from the wixEvents module of the Wix client.
                // This method retrieves a list of events.
                // In this case, we're limiting the number of events to 10.
                const eventsList = await myWixClient.wixEvents
                    .queryEvents()
                    .limit(10)
                    .find();

                // Then, we update the state of the events list in the React component.
                setEventsList(eventsList.items);
            });
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            setIsLoading(false);
        }
    }

    // This function fetches the availability of tickets for a specific event.
    async function fetchTicketsAvailability(event) {
        await handleAsync(async () => {
            // We call the queryAvailableTickets method from the checkout module of the Wix client.
            // This method retrieves the available tickets for a specific event.
            // We filter the tickets by the event ID and limit the number of tickets to 10.
            const tickets = await myWixClient.checkout.queryAvailableTickets({
                filter: {eventId: event._id},
                limit: 10,
            });

            // Then, we update the state of the tickets availability in the React component.
            setTicketsAvailability(tickets.definitions);

            // We also update the selected event in the state.
            setSelectedEvent(event);
        });
    }

    // This function creates a redirect to the checkout page for a specific ticket.
    async function createRedirect(ticket) {
        await handleAsync(async () => {
            try {// We find the event associated with the ticket from the events list.
                // We're interested in the slug of the event, which is a URL-friendly version of the event name.
                const eventSlug = eventsList.find(
                    (event) => event._id === ticket.eventId,
                ).slug;

                // We call the createReservation method from the checkout module of the Wix client.
                // This method creates a reservation for the ticket.
                // We pass the event ID and an object that specifies the quantity of the ticket.
                const reservation = await myWixClient.checkout.createReservation(
                    ticket.eventId,
                    {
                        ticketQuantities: [
                            {
                                ticketDefinitionId: ticket._id,
                                quantity: 1,
                            },
                        ],
                    },
                );

                // We call the createRedirectSession method from the redirects module of the Wix client.
                // This method creates a redirect session to the checkout page.
                // We pass an object that specifies the event slug and the reservation ID for the eventsCheckout.
                // We also specify the postFlowUrl to be the current page URL. This is where the user will be redirected after the checkout flow.
                const redirect = await myWixClient.redirects.createRedirectSession({
                    eventsCheckout: {eventSlug, reservationId: reservation._id},
                    callbacks: {postFlowUrl: window.location.href},
                });

                // We update the selected ticket in the state.
                setSelectedTicket(ticket);

                // Finally, we redirect the user to the URL generated by the redirect session.
                window.location = redirect.redirectSession.fullUrl;
            } catch (e) {
                openModal("premium", {
                    primaryAction: () => {
                        window.open(
                            `https://manage.wix.com/premium-purchase-plan/dynamo?siteGuid=${msid || ""}`,
                            "_blank"
                        );
                    },
                });
            }
        });
    }

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <>
            <Head>
                <title>Events Page</title>
            </Head>

            <main data-testid={testIds.EVENTS_PAGE.CONTAINER}>
                <div>
                    <h2>Choose an Event:</h2>
                    {isLoading ? (
                        <p>Loading events...</p>
                    ) : eventsList.length > 0 ? (
                        eventsList.map((event) => {
                            return (
                                <section
                                    key={event._id}
                                    data-testid={testIds.EVENTS_PAGE.EVENT}
                                    className={`${styles.selectable} ${event === selectedEvent ? styles.active : ""}`}
                                    // When the section is clicked, we fetch the availability of tickets for the event.
                                    onClick={() => fetchTicketsAvailability(event)}
                                >
                                    {/* We display the title of the event. */}
                                    {event.title}
                                </section>
                            );
                        })
                    ) : (
                        <div>
                            <p>No events available</p>
                            <Link
                                href={`https://manage.wix.com/dashboard/${msid}/events`}
                                rel="noopener noreferrer"
                                target="_blank"
                                style={{textDecoration: "underline", color: "#0070f3"}}
                            >
                                Create an event
                            </Link>
                        </div>
                    )}
                </div>
                <div>
                    <h2>Choose a Ticket:</h2>
                    {ticketsAvailability.length === 0 && selectedEvent && (
                        <div>
                            <p>No tickets available</p>
                            <Link
                                href={`https://manage.wix.com/dashboard/${msid}/events/event/${selectedEvent?._id}/tickets/new`}
                                target={"_blank"}
                                style={{color: "#0070f3"}}
                            >
                                Create a ticket for this event
                            </Link>
                        </div>
                    )}
                    {/* We map over the tickets availability list and create a section for each ticket. */}
                    {ticketsAvailability.map((ticket) => {
                        return (
                            <section
                                key={ticket._id}
                                data-testid={testIds.EVENTS_PAGE.TICKET_OPTION}
                                // When the section is clicked, we create a redirect to the checkout page for the ticket.
                                onClick={() => createRedirect(ticket)}
                                className={`${styles.selectable} ${ticket === selectedTicket ? styles.active : ""}`}
                            >
                                {/* We display the name of the ticket. */}
                                {ticket.name}
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
            title: "Events & Tickets",
        },
    };
}
