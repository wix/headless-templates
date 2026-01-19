export default async function loadFramewire(withInit) {
    // Send error to parent using framewire
    const isDev = import.meta.env?.DEV ?? false;
    const isIframe = window.self !== window.top;

    if (!isDev || !isIframe) {
      return;
    }

  try {
    if (!globalThis.framewire) {
      const url = getFramewireUrl();
      const framewireModule = await import(url);
      globalThis.framewire = framewireModule;
      console.log("Framewire loaded");
    }
    if (withInit) {
      globalThis.framewire.init({}, import.meta.hot);
      console.log("Framewire initialized");
    }
  } catch (error) {
    console.error("Failed to initialize Framewire:", error);
  }
}

function getVersion() {
  const storedVersion = localStorage.getItem("framewireVersion");
  const defaultVersion = "dist";
  const urlVersion = new URLSearchParams(location.search).get("framewire");
  if (urlVersion) {
    localStorage.setItem("framewireVersion", urlVersion);
  }
  return urlVersion || storedVersion || defaultVersion;
}

function getFramewireUrl() {
  const version = getVersion();
  const localUrl = "http://localhost:3202/framewire/index.mjs";
  const cdnUrl = `https://static.parastorage.com/services/framewire/${version}/index.mjs`;
  const isLocal = version === "local";
  return isLocal ? localUrl : cdnUrl;
}
