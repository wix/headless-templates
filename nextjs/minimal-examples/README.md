# Wix Headless Examples

This [Next.js](https://nextjs.org/) project provides a minimal example site to demonstrate basic usage of various Wix
Headless APIs. The implementation focuses on simplicity and readability, rather than feature richness, performance, or
completeness. This repository can be used as a quick reference for bootstrapping a Wix Headless application.

For a more comprehensive example of Wix Headless integration, we recommend checking out
our [starter templates](https://www.wix.com/developers/headless/templates).

You can view the latest version of this repo deployed
at [https://wix-headless-example.vercel.app/](https://wix-headless-example.vercel.app/).

## Getting Started

There are two ways to experiment with the example site functionality:

### Code Sandbox

1. Fork the CodeSandbox project by click **Fork** in the top right corner, after signing in.
2. In [constants/constants.js](./constants/constants.js), replace the existing client ID with your own. You can find
   your client
   ID
   under [headless settings](https://www.wix.com/my-account/site-selector/?buttonText=Select%20Site&title=Select%20a%20Site&autoSelectOnSingleSite=true&actionUrl=https:%2F%2Fwww.wix.com%2Fdashboard%2F%7B%7BmetaSiteId%7D%7D%2Foauth-apps-settings)
   in your project dashboard.
3. **Make sure you save any changes in order to see their effect**

### Copy the project to your local workspace

1. Clone the [github repo](https://github.com/wix/headless-templates/tree/main/nextjs/minimal-examples).
2. Run the following commands:

    ```bash
    cd wix-headless-example
    npm install
    ```

3. In [constants/constants.js](./constants/constants.js), replace the existing client ID with your own. You can find
   your client
   ID
   under [headless settings](https://www.wix.com/my-account/site-selector/?buttonText=Select%20Site&title=Select%20a%20Site&autoSelectOnSingleSite=true&actionUrl=https:%2F%2Fwww.wix.com%2Fdashboard%2F%7B%7BmetaSiteId%7D%7D%2Foauth-apps-settings)
   in your project dashboard.
4. Run the development server:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Wix Headless APIs Usage

This project demonstrates the usage of various Wix Headless APIs. Here's a brief overview of each:

### Headless Bookings

The [`pages/booking.js`](./pages/booking.js) file demonstrates how to use
the [Wix Bookings API](https://dev.wix.com/docs/sdk/backend-modules/bookings/bookings/introduction) to fetch a list of
services and their availability from your site.

> **[Wix Bookings API](https://dev.wix.com/docs/sdk/backend-modules/bookings/bookings/introduction)**: This API allows
> you to manage bookings for a site's services. It holds information about the customer and the session or schedule they
> have booked.

### Headless eCommerce

The [`pages/store.js`](./pages/store.js) file demonstrates how to fetch a list of products from your site using
the [Wix Stores API](https://dev.wix.com/docs/sdk/backend-modules/stores). It also demonstrates how to use
the [Wix eCommerce API](https://dev.wix.com/docs/sdk/backend-modules/ecom/introduction) to manage carts and checkouts.

> **[Wix Stores API](https://dev.wix.com/docs/sdk/backend-modules/stores)**: This API allows you to manage your store
> inventory, orders, and collections.
> It provides a comprehensive set of services for customizing store functionality.
>
> **[Wix eCommerce API](https://dev.wix.com/docs/sdk/backend-modules/ecom/introduction)**: This API provides a
> comprehensive set of services for customizing eCommerce functionality on your sites.
> It allows you to manage a site visitor's cart, handle checkout and payment flow, create and manage discount rules,
> promote items, and manage orders.

### Headless Tickets

The [`pages/tickets.js`](./pages/tickets.js) file demonstrates how to use
the [Wix Events API](https://dev.wix.com/docs/sdk/backend-modules/events/introduction) to fetch a list of events and
their available tickets from your site.

> **[Wix Events API](https://dev.wix.com/docs/sdk/backend-modules/events/introduction)**: This API provides
> functionality for creating, updating, and managing events.
> It allows you to manage event details like location, scheduling, registration, tickets, RSVPs, online conferencing,
> messaging customization, and basic registration form customization.
