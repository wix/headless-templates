# Astro Forms Template

A simple and minimal forms template built with Astro. This template includes a form for soccer tournament registration with various field types and responsive design.

## Features

- 100% Astro components
- Tailwind CSS for styling
- Responsive design
- Form validation
- Success page
- Multiple form field types: text, email, select, radio buttons, checkboxes, and textarea

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Build

Build for production:

```bash
npm run build
# or
yarn build
```

### Preview

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Button.astro
│   │   ├── FormField.astro
│   │   ├── SuccessMessage.astro
│   │   └── TournamentRegistrationForm.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro
│   │   └── success.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Customization

You can customize the form fields, styling, and behavior by modifying the following files:

- `src/components/TournamentRegistrationForm.astro` - Main form component
- `src/components/FormField.astro` - Form field component
- `src/styles/global.css` - Global styles and Tailwind utilities

## License

This project is licensed under the MIT License.