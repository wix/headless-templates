[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwix%2Fheadless-templates%2Ftree%2Fmain%2Fnextjs%2Fcommerce&env=COMPANY_NAME,WIX_CLIENT_ID,SITE_NAME,TWITTER_CREATOR,TWITTER_SITE&envDescription=Supply%20the%20Wix%20Client%20ID%20for%20your%20Wix%20Store.&demo-title=Wix%20Store%20Demo&demo-description=A%20NextJS%20Commerce%20site%20working%20with%20Wix%20Stores&demo-url=https%3A%2F%2Fwix-nextjs-commerce.vercel.app%2F)

# Next.js Commerce with Wix Stores

A high-performance, server-rendered Next.js App Router ecommerce application.

This template uses React Server Components, Server Actions, `Suspense`, `useOptimistic`, and more.

Together with a Wix Store for headless commerce featuring:

- Products & Collections Management
- Inventory management
- Cart and abandoned cart reminders
- Checkout pages
- Order management
- Much more!

## Setting up a Wix Store

For this template to fully function, you need to set up a Wix Store before developing.

Here you can find the [full documentation on getting started with Wix Headless](https://dev.wix.com/docs/go-headless/getting-started/about-headless/about-wix-headless). Explore the documentation to learn more about building headless experiences with Wix.

### Create a new Wix Store TL;DR

- Create a new Project ([Docs](https://dev.wix.com/docs/go-headless/getting-started/setup/general-setup/create-a-project))
  - Be sure to select the ecommerce business solution
- Create an OAuth App for headless authentication ([Docs](https://dev.wix.com/docs/go-headless/getting-started/setup/authentication/create-an-oauth-app-for-visitors-and-members))
- Copy the Client ID of your new OAuth App for use in your local environment

### Preparing your Wix Store content

This template makes a few assumptions about the contents of your Wix Store. You can always change things later, but to get the initial template fully functioning, follow these instructions to prepare your store:

#### Categories

In your Wix Dashboard, access the **Categories** page (under **Store Products** -> **Categories**)and create the following categories:

- `hidden-homepage-featured-items` - These products will be displayed as featured products above the fold in the website homepage.
- `hidden-homepage-carousel` - These products will be displayed in a carousel on the bottom of the homepage.

You can create more collections (like `Clothes`, `House Items`, etc.) that will also be displayed on your site in the search results page.

### Data Collections

Use Wix CMS to manage your site's content, such as menus and pages. The code in this templates assumes some data collections with a certain structure exist in the Wix CMS.

To create your data collections, go to the CMS in your Wix Dashboard sidebar and create the following collections using the `Create Collection` button:

- Pages - stores the content of the dynamic pages of your site

  - Collection Name: `Pages`
  - Collection ID: `Pages`

  | Field Name      | Key            | Type      |
  | --------------- | -------------- | --------- |
  | Title           | title          | Text      |
  | Slug            | slug           | Text      |
  | SEO Title       | seoTitle       | Text      |
  | SEO Description | seoDescription | Text      |
  | Body            | body           | Rich Text |

  - Create some pages for your store, for example: About page, Terms and Conditions, Shipping and Return Policy, FAQ, and more. You can use the `Body` field to add the content of the page. The `SEO Title` and `SEO Description` fields will be used to set the SEO metadata of the page.

- Menus - stores the top menu and footer menu details

  - Collection Name: `Menus`
  - Collection ID: `Menus`

  | Field Name | Key   | Type                                          |
  | ---------- | ----- | --------------------------------------------- |
  | Pages      | pages | Multi-Reference, Referenced Collection: Pages |
  | Slug       | slug  | Text                                          |

  - Create menus with the following slugs:
    - `next-js-frontend-header-menu` - Top menu of the site
    - `next-js-frontend-footer-menu` - Footer menu of the site

## Integrations

Integrations enable upgraded or additional functionality for Next.js Commerce

- [Orama](https://github.com/oramasearch/nextjs-commerce) ([Demo](https://vercel-commerce.oramasearch.com/))

  - Upgrades search to include typeahead with dynamic re-rendering, vector-based similarity search, and JS-based configuration.
  - Search runs entirely in the browser for smaller catalogs or on a CDN for larger.

- [React Bricks](https://github.com/ReactBricks/nextjs-commerce-rb) ([Demo](https://nextjs-commerce.reactbricks.com/))
  - Edit pages, product details, and footer content visually using [React Bricks](https://www.reactbricks.com) visual headless CMS.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js Commerce. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables) for this, but a `.env` file is all that is necessary. Be sure to set the value for WIX_CLIENT_ID to the Client ID from your Store's OAuth App.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control your store.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).
