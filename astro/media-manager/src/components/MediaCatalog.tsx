import React from "react";
import type { MediaItem } from "../types";

interface MediaCatalogProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

const MediaCatalog: React.FC<MediaCatalogProps> = ({
  items,
  onSelect,
  onDelete,
  selectedId,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center p-4 bg-background rounded-lg">
        <p className="text-secondary">No media items uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`relative group rounded-lg overflow-hidden border ${
            selectedId === item.id ? "border-primary" : "border-secondary/20"
          }`}
        >
          {item.type.startsWith("image/") ? (
            <img
              src={item.url}
              alt={item.name}
              className="w-full h-32 object-cover"
            />
          ) : (
            <video src={item.url} className="w-full h-32 object-cover" muted />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onSelect(item)}
              className="bg-white text-secondary rounded-full p-2 mx-1 hover:bg-primary hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="bg-white text-secondary rounded-full p-2 mx-1 hover:bg-error hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
          <div className="p-2 text-sm truncate text-secondary">{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default MediaCatalog;
