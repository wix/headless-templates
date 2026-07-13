/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WIX_CLIENT_ID: string;
  readonly PUBLIC_WIX_RENTALS_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
