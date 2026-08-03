# Inspiration templates

Community-contributed templates that show what can be built with Wix Headless. Unlike the templates under [`astro/`](../astro/), these are **not** part of the `wix headless init` CLI catalog and are not paired with a Wix site template — they're here to inspire and to demonstrate integration patterns.

## Contributing

Add your template as a folder here (`inspiration/<your-template-name>/`) and open a PR. Requirements:

- **Self-contained**: installs and runs with `npm install` + `npm run dev` after connecting a Wix site (include a README with setup steps and which Wix apps the site needs).
- **Wix is the source of truth**: fetch services, forms, products, posts, prices, etc. from the Wix SDKs — no hardcoded business data. See [AGENTS.md](../AGENTS.md) for the full integration standards.
- **No secrets**: never commit `.wix/`, `.env.local`, client IDs, or API keys.
- **Keep it lean**: these are starting points, not products — small dependency footprints and readable code travel further than polish.

Templates here are maintained by their contributors and may not be kept up to date with the latest SDK versions.
