# 🚀 Wix AstroWind Template

This project combines the popular [AstroWind template](https://github.com/onwidget/astrowind) with **[Wix Headless](https://dev.wix.com/docs/go-headless)**, enabling seamless content management with Wix while delivering a high-performance, modern Astro site.

## 📖 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)

## ✨ Features

- **🌟 AstroWind-powered site** – A feature-rich, elegant, and highly performant template built with **Astro** and **Tailwind CSS**, designed for modern content-driven and optimized performance websites.
- **📝 Wix CMS & Blog Integration** – Manage content dynamically through the Wix CMS and Wix Blog.
- **💲 Wix Pricing Plans Integration** – Display pricing tiers and connect users to the Wix Checkout page.
- **🔗 Seamless Data Fetching** – Uses [`@wix/astro`](https://www.npmjs.com/package/@wix/astro) to integrate and fetch Wix content.

## 🌍 Live Demo

Check out the **Wix AstroWind Demo** here:

👉 **[Live Demo](https://wix-astro-astrowind-demo.netlify.app/)** 

## ⚡ Installation

### 1️⃣ Create the project

Scaffold a new Wix AstroWind project using the official template:

```sh
npm create astro@latest -- --template wix/headless-templates/astro/astrowind
```

### 2️⃣ Pull environment variables

Sync required API keys and settings with Wix:

```sh
npx wix edge pull-env
```

This generates a `.env.local` file with your environment variables.

### 3️⃣ Start the development server

Run the local development server:

```sh
npm run dev
```

Visit **[http://localhost:4321/](http://localhost:4321/)** to view your site. 🎉

### 4️⃣ Manage content

The site includes **sample content** to start. Edit or add new content via the **Wix Dashboard**:

1. Open the **Wix Dashboard** → **CMS**, **Blog** or **Pricing Plans**.
2. Update or create new entries for blog posts, services and pricing plans.
3. Modify **titles, content, images and sections**.
4. Publish or save as a draft.

More details:

- [Wix CMS Docs](https://support.wix.com/en/cms)
- [Wix Blog Docs](https://support.wix.com/en/wix-blog)
- [Wix Pricing Plans Docs](https://support.wix.com/en/wix-pricing-plans)

## 🛠 How It Works

- **📝 Content Management** – Create and manage content dynamically in the **Wix CMS Dashboard**, including blog posts, services, and pricing plans.

- **📡 Data Fetching** – The `@wix/astro` adapter enables seamless data retrieval using the **Wix SDK**:

  - **Blog Posts** – Uses `wixBlogLoader` to dynamically fetch and format blog posts and create the blog collection.
  - **Services Page** – Retrieves CMS data from a **single collection** to render the services page content.
  - **Pricing Plans** – Fetches pricing details and displays structured pricing tiers.

  Thanks to the `wix()` Astro adapter from `@wix/astro`, all content is efficiently retrieved and integrated into the astro template.

- **⚡ Fast & Optimized** – Pages are statically generated for speed while still supporting real-time content updates from Wix.

## 🚀 Deployment

To deploy your site, run the following command:

```sh
npm run deploy:prod
```

This will build and deploy your site to the configured hosting platform. Ensure that all necessary environment variables are set before running this command.

### Alternative Deployment Options

If you prefer to deploy manually, you can use **Vercel, Netlify, GitHub Pages**, or any other hosting service while still maintaining dynamic content capabilities from Wix.
