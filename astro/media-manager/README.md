# Astro Media Manager Template

A modern and responsive media management template built with Astro and React. This template provides a user-friendly interface for uploading, viewing, and managing media files like images and videos.

## Features

- Drag and drop file upload
- Image and video support
- Responsive grid layout
- Preview thumbnails
- Detailed media viewer
- Delete functionality
- Modern UI with Tailwind CSS

## 🚀 Getting Started

1. Create a new project using this template:

```bash
npm create astro@latest -- --template media-manager
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## 📦 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── MediaManager.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── MediaCatalog.tsx
│   │   └── MediaViewer.tsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── types.ts
└── package.json
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

## 👀 Want to learn more?

Check out [Astro's documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).
