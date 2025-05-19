import type { MediaItem } from "../types";

export function dispatchItemSelectedEvent(item: MediaItem): void {
  const event = new CustomEvent("item:selected", {
    detail: { item },
  });
  document.dispatchEvent(event);
}

export function dispatchUploadCompleteEvent(file: any): void {
  const event = new CustomEvent("upload:complete", {
    detail: { file },
  });
  document.dispatchEvent(event);
}

export function dispatchMediaUpdatedEvent(item: MediaItem): void {
  const event = new CustomEvent("media:updated", {
    detail: { item },
  });
  document.dispatchEvent(event);
}
