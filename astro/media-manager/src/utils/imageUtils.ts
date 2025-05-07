export function getImageIdFromUrl(url: string): string | null {
  if (!url || !url.includes("wixstatic.com")) return null;

  try {
    const urlParts = url.split("/");
    const mediaSegment = urlParts.findIndex((part) => part === "media");

    if (mediaSegment !== -1 && mediaSegment + 1 < urlParts.length) {
      return urlParts[mediaSegment + 1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function getImageId(url: string): string {
  return getImageIdFromUrl(url) || "";
}
