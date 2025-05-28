# 🚀 Wix Astro Media Manager Template

A modern, responsive media management template built with **Astro** and **Wix Headless**. This template provides a user-friendly interface for uploading, viewing, and managing media files like images and videos, leveraging Wix APIs and Astro's fast, component-driven architecture.

## ✨ Features

- Drag and drop file upload
- Image and video support
- Responsive grid layout
- Preview thumbnails
- Detailed media viewer
- Delete functionality
- Modern UI with Tailwind CSS
- Built with Astro and Wix Headless APIs

## 📖 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Commands](#-commands)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)
- [Resources](#-resources)

## 🚀 Getting Started

### 1️⃣ Create a new project using this template

```bash
npm create astro@latest -- --template wix/headless-templates/astro/media-manager
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the development server

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to view your site.

### 4️⃣ Environment Variables

If you use Wix APIs, set your `WIX_CLIENT_ID` in a `.env.local` file:

```properties
WIX_CLIENT_ID=your-wix-client-id
```

[How to get a Wix Client ID?](https://dev.wix.com/docs/go-headless/getting-started/setup/authentication/create-an-oauth-app-for-visitors-and-members)

## 📦 Project Structure

```
/
├── src/
│   ├── actions/
│   ├── components/
│   │   ├── MediaManager.astro
│   │   ├── MediaUploader.astro
│   │   └── MediaCatalog.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── styles/
│   │   └── global.css
│   ├── types.ts
│   └── utils/
├── package.json
└── ...
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command             | Action                                           |
| :------------------ | :----------------------------------------------- |
| `npm install`       | Installs dependencies                            |
| `npm run dev`       | Starts local dev server at `localhost:4321`      |
| `npm run build`     | Build your production site to `./dist/`          |
| `npm run preview`   | Preview your build locally, before deploying     |
| `npm run astro ...` | Run CLI commands like `astro add`, `astro check` |

## 🛠 How It Works

- **Media Management**: Upload, preview, and delete images and videos.
- **Wix Integration**: (If enabled) Connects to Wix APIs for media storage and management.
- **Modern UI**: Built with Tailwind CSS for a clean, responsive experience.

## 🚀 Deployment

To deploy your site, run:

```bash
npm run build
```

Then deploy the `dist/` folder to your preferred hosting provider (Vercel, Netlify, etc).

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)
