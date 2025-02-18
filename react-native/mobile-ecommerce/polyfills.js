import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { TextEncoder, TextDecoder } from "text-encoding";

if (typeof TextEncoder === "undefined") {
  Object.defineProperty(window, "TextEncoder", {
    configurable: true,
    enumerable: true,
    get: () => TextEncoder,
  });
}

if (typeof TextDecoder === "undefined") {
  Object.defineProperty(window, "TextDecoder", {
    configurable: true,
    enumerable: true,
    get: () => TextDecoder,
  });
}

polyfillWebCrypto();
