import React, { useState, useEffect } from "react";
// Import to be used when properly configured
import { Image } from "@wix/image";
import type { MediaItem } from "../types";

interface MediaViewerProps {
  item: MediaItem | null;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item }) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(item);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Listen for item:selected events from the Astro component
  useEffect(() => {
    const handleItemSelected = (event: CustomEvent) => {
      setSelectedItem(event.detail.item);
      setIsOpen(true); // Open the modal when an item is selected through the preview button
    };

    // Add event listener for item selection
    document.addEventListener(
      "item:selected",
      handleItemSelected as EventListener
    );

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener(
        "item:selected",
        handleItemSelected as EventListener
      );
    };
  }, []);

  // Add event listener for Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // When the item prop changes directly
  useEffect(() => {
    if (item) {
      setSelectedItem(item);
    }
  }, [item]);

  const closeModal = () => {
    setIsOpen(false);
  };

  // If no item selected or modal is closed, return an empty fragment
  if (!selectedItem || !isOpen) {
    return null;
  }

  const formatFileSize = (url: string) => {
    // This is a placeholder - in real apps you'd calculate actual file size
    return "1.2 MB";
  };

  // Extract image ID from Wix URL if available
  const getImageIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes("wixstatic.com")) {
      return null;
    }

    try {
      // Example URL: https://static.wixstatic.com/media/11062b_5f918a05d6cd428a9c47d496780b289d~mv2_d_5760_3840_s_4_2.jpg
      const urlParts = url.split("/");
      const mediaSegment = urlParts.findIndex((part) => part === "media");

      if (mediaSegment !== -1 && mediaSegment + 1 < urlParts.length) {
        // Extract the ID part (everything before file extension if present)
        const idWithExtension = urlParts[mediaSegment + 1];
        return idWithExtension.split(".")[0];
      }

      return null;
    } catch (error) {
      console.error("Error extracting image ID:", error);
      return null;
    }
  };

  // Only showing modal view
  return (
    <div
      className="fixed inset-0 bg-gray-100 bg-opacity-15 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking on the backdrop (not when clicking on the modal content)
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-medium text-gray-700 text-sm">File Details</h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Preview area */}
          <div className="flex-grow overflow-hidden bg-gray-100 relative">
            <div
              className="bg-black flex items-center justify-center overflow-hidden"
              style={{ width: "100%", height: "400px" }}
            >
              {selectedItem.mediaType === "IMAGE" ? (
                // @ts-expect-error Ignoring the type error for now as this will be properly configured later
                <Image
                  uri="11062b_9c53b59db1dc4bd4ad7a47340f0594b4~mv2.jpg"
                  width={5000}
                  height={2763}
                  displayMode="fill"
                  containerWidth={800}
                  containerHeight={400}
                  isInFirstFold
                  isSEOBot
                  shouldUseLQIP
                  alt={selectedItem.name}
                />
              ) : (
                <video
                  src={selectedItem.url}
                  controls
                  className="max-w-full max-h-full"
                />
              )}
            </div>
          </div>

          {/* File info */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 truncate">
                {selectedItem.name}
              </h4>
              <span className="text-xs text-gray-500">
                Uploaded on{" "}
                {new Date(selectedItem._createdDate).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-800 font-medium">
                  {selectedItem.mediaType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="text-gray-800 font-medium">
                  {formatFileSize(selectedItem.url)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <a
                href={selectedItem.url}
                download={selectedItem.name}
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
                title="Open"
                onClick={() => window.open(selectedItem.url, "_blank")}
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
      </div>
    </div>
  );
};

export default MediaViewer;
