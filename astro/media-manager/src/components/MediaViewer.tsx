import React from "react";
import type { MediaItem } from "../types";

interface MediaViewerProps {
  item: MediaItem | null;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item }) => {
  if (!item) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg p-4">
        <svg
          className="w-12 h-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-700 font-medium">No media selected</p>
        <p className="text-gray-500 text-sm mt-1">Select an item to preview</p>
      </div>
    );
  }

  const formatFileSize = (url: string) => {
    // This is a placeholder - in real apps you'd calculate actual file size
    return "1.2 MB";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-medium text-gray-700 text-sm">File Details</h3>
      </div>

      {/* Preview area */}
      <div className="flex-grow overflow-hidden bg-gray-100 relative">
        <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
          {item.type.startsWith("image/") ? (
            <img
              src={item.url}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video src={item.url} controls className="max-w-full max-h-full" />
          )}
        </div>
      </div>

      {/* File info */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
          <span className="text-xs text-gray-500">
            Uploaded on {new Date(item.uploadDate).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="text-gray-800 font-medium">
              {item.type.split("/")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Size</span>
            <span className="text-gray-800 font-medium">
              {formatFileSize(item.url)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <a
            href={item.url}
            download={item.name}
            className="flex-1 flex justify-center items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download
          </a>
          <button
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center"
            title="Delete"
            onClick={() => window.open(item.url, "_blank")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
            </svg>
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
