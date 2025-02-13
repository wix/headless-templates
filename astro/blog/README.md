# 🚀 Wix Astro Blog Template

This project combines the official [Astro Blog template](https://github.com/withastro/astro/tree/main/examples/blog) with **[Wix Headless](https://dev.wix.com/docs/go-headless)**, enabling seamless content management with Wix while delivering a high-performance static site using Astro.

## 📖 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)

## ✨ Features

- **🚀 Astro-powered blog** – A minimal, performant, and SEO-friendly blog template built with **Astro**.
- **📝 Wix Blog as a Headless CMS** – Manage blog content directly in the **Wix Dashboard**, including posts, categories, and tags.
- **🔗 Seamless Data Fetching** – Uses [`@wix/astro`](https://www.npmjs.com/package/@wix/astro) to fetch and display blog content dynamically.

## 🌍 Live Demo

Check out the **Wix Astro Blog Demo** here:

👉 **[Live Demo](https://netlify.blog-demo.wix.dev/)**

## ⚡ Installation

### 1️⃣ Create the project

Scaffold a new Wix Astro Blog project using the official template:

```sh
npm create astro@latest -- --template wix/headless-templates/astro/blog
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

Visit **[http://localhost:4321/](http://localhost:4321/)** to view your blog. 🎉

### 4️⃣ Manage content

The blog includes **sample posts** to start. Edit or add new posts via the **Wix Blog Dashboard**:

1. Open the **Wix Dashboard** → **Blog**.
2. Update or create new posts.
3. Modify **titles, content, images, and tags**.
4. Publish or save as a draft.

More details:

- [Wix Blog Docs](https://support.wix.com/en/wix-blog-1401920)

## 🛠 How It Works

- **📝 Content Management** – Create and manage blog posts, categories, and tags directly in the **Wix Blog Dashboard**.

- **📡 Data Fetching** – The `@wix/astro` adapter enables seamless data retrieval using the **Wix SDK**:

  - **Blog Posts** – Uses `wixBlogLoader` to dynamically fetch and format blog posts, creating the blog content collection.

  Thanks to the `wix()` Astro adapter from `@wix/astro`, all content is efficiently retrieved and integrated into the Astro Blog template.

- **⚡ Fast & Optimized** – Blog posts are statically generated for speed while still allowing dynamic updates via Wix.

## 🚀 Deployment

To deploy your site, run the following command:

```sh
npm run deploy:prod
```

This will build and deploy your site to the configured hosting platform. Ensure that all necessary environment variables are set before running this command.

### Alternative Deployment Options

If you prefer to deploy manually, you can use **Vercel, Netlify, GitHub Pages**, or any other hosting service while still maintaining dynamic content capabilities from Wix.
