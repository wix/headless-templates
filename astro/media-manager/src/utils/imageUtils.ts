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

export const DEFAULT_IMAGE_ID =
  "11062b_9c53b59db1dc4bd4ad7a47340f0594b4~mv2.jpg";

export function getImageId(url: string): string {
  return getImageIdFromUrl(url) || DEFAULT_IMAGE_ID;
}
