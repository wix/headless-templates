# Wix Astro Registration Template

A minimal Astro site that renders a registration form powered by [Wix Forms](https://dev.wix.com/docs/sdk/backend-modules/forms/introduction).

## How it connects to Wix Forms

- `src/components/RegistrationForm.astro` fetches the form definition at build/render time with `forms.getForm(WIX_FORM_ID)` and renders every input field (text, email, phone, number, date, textarea, dropdown, radio, checkbox, checkbox group), grouped by the form's steps.
- `src/utils/form-service.ts` submits the values client-side with `submissions.createSubmission` from `@wix/forms`.
- `src/utils/constants.ts` holds the form ID; replace it to point at your own form.

Authentication is handled by the [`@wix/astro`](https://dev.wix.com/docs/go-headless) integration via the `WIX_CLIENT_ID` environment variable.

## Commands

```bash
npm install
npm run dev    # start the dev server
npm run build  # build for production
```

## Need help?

- [Wix Headless Documentation](https://dev.wix.com/docs/go-headless)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [Community on Discord](https://discord.gg/n6TBrSnYTp)
