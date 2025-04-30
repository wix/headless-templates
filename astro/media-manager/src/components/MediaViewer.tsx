import React from "react";
import type { MediaItem } from "../types";

interface MediaViewerProps {
  item: MediaItem | null;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item }) => {
  if (!item) {
    return (
      <div className="h-full flex items-center justify-center text-secondary">
        <p>Select a media item to view</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-background rounded-lg overflow-hidden">
        {item.type.startsWith("image/") ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <video src={item.url} controls className="w-full h-full" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-secondary">{item.name}</h3>
        <p className="text-sm text-secondary/70">Type: {item.type}</p>
        <p className="text-sm text-secondary/70">
          Uploaded: {new Date(item.uploadDate).toLocaleString()}
        </p>
        <div className="mt-4">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
