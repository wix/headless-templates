import type { PageMetadata } from "@wix/astro-pages";

/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly BASE_NAME: string;
  }
}

declare module "react-router-dom" {
  export interface IndexRouteObject {
    routeMetadata?: PageMetadata;
  }
  export interface NonIndexRouteObject {
    routeMetadata?: PageMetadata;
  }
}
