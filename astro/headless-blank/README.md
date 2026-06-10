# Wix Astro Headless Blank Template

A minimal Wix Headless Astro starter that is **release-ready out of the box** —
identical to `blank`, plus the server adapter (`@wix/cloud-provider-fetch-adapter`)
and `output: "server"` that production builds require.

Use this when you consume the template **programmatically** — copied or
`degit`'d into a project that is already bound to an existing Wix site (its own
`wix.config.json`) rather than scaffolded through the Wix CLI. The CLI injects
the adapter for you when it scaffolds `blank`; this template bakes it in so
`wix build` / `wix release` work without that step.

```bash
npm install
npx @wix/cli@latest env pull
npx @wix/cli@latest dev      # develop
npx @wix/cli@latest build && npx @wix/cli@latest release   # ship
```

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)
