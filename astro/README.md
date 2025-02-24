<h1 align="center">Wix Astro Templates</h1>

This folder contains website templates built with Astro and Wix APIs. These templates come pre-configured with the [Wix Astro Integration](https://github.com/wix-incubator/headless-integrations/tree/main/packages/%40wix-astro#readme) which provides a boilerplate-free setup, allowing developers to build custom frontends on top of Wix APIs while benefiting from Astro’s fast and lightweight framework.

## Templates

The following templates showcase the integration of Astro with Wix APIs and the different business solutions available. They can be used as starting points for new projects or as reference implementations when integrating these features into your own projects.

<table>
  <thead>
    <tr>
      <th>Template</th>
      <th>Description</th>
      <th>Live Demo</th>
      <th>Wix Apps Used</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://github.com/wix/headless-templates/tree/main/astro/astrowind">AstroWind</a></td>
      <td>Integrates Astro with Tailwind CSS, providing advanced slot usage and dark mode configuration.</td>
      <td></td>
      <td>CMS, Wix Blog, Wix Pricing Plans</td>
    </tr>
    <tr>
      <td><a href="https://github.com/wix/headless-templates/tree/main/astro/blog">Blog</a></td>
      <td>Combines the official Astro Blog template with Wix Headless for seamless content management and high-performance static site using Astro.</td>
      <td></td>
      <td>Wix Blog</td>
    </tr>
    <tr>
      <td><a href="https://github.com/wix/headless-templates/tree/main/astro/commerce">Commerce</a></td>
      <td>A template for creating e-commerce sites using Astro and Wix Headless.</td>
      <td></td>
      <td>Wix Stores</td>
    </tr>
  </tbody>
</table>

## Getting Started

The easiest way to get started with the Wix integration for Astro is to scaffold a new Astro project with one of the Wix templates. If you already have an Astro project or rather start with another template, you can add the Wix integration to an existing Astro project.

### Scaffold a New Astro Project with a Wix Template

Wix provides a collection of Astro templates that are pre-configured with the Wix integration for Astro and also act as a starting point for different types of projects. Check out our Wix Astro templates on GitHub: [wix/headless-templates/astro](https://github.com/wix/headless-templates/tree/main/astro).

```bash
# npm
npm create astro@latest -- --template wix/headless-templates/astro/<template-name>
# yarn
yarn create astro@latest --template wix/headless-templates/astro/<template-name>
# pnpm
pnpm create astro@latest --template wix/headless-templates/astro/<template-name>
```

Check the template's README for more information on how to get started with the template.

### Setting up local development

> 💡 If you are deploying your project to Wix, check out the guide on [local development with the Wix CLI](TBD).

The Wix integration requires the `WIX_CLIENT_ID` environment variable to be set. For local development, you can create a `.env.local` file in the root of your project and add the `WIX_CLIENT_ID` environment variable.

```properties
WIX_CLIENT_ID=your-wix-client-id
```

> ❓ Not sure what the Wix Client ID is or how to obtain it? Check out our documentation to [Create an OAuth App](https://dev.wix.com/docs/go-headless/getting-started/setup/authentication/create-an-oauth-app-for-visitors-and-members)

## Need Help?

For documentation and support, check out:
- [Wix Astro Integration Documentation](https://github.com/wix-incubator/headless-integrations/tree/main/packages/%40wix-astro#readme)
- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)

Happy coding with Astro & Wix Headless! 🚀

