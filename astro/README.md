# Wix Astro Templates

Our Astro templates are still in development and subject to change.

To use a template, follow the [Wix CLI for Headless Quick Start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), and select the desired template during the setup process.

## Templates not yet in the CLI's choices

`templates.json` can list a template before the released CLI offers it under `--site-template`
(the CLI ships its own list of names). Any entry here can still be created from directly:

```bash
npm create @wix/new@latest headless -- \
  --template-repo https://github.com/wix/headless-templates.git \
  --template-repo-path astro/<template-folder>
```

## Need help?

For documentation and support, check out:

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)