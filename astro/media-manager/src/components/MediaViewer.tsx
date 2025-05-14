import { Image } from "@wix/image";
import React, { useEffect, useState } from "react";
import type { MediaItem } from "../types";
import { dispatchMediaUpdatedEvent } from "../utils/eventUtils";
import { getImageId } from "../utils/imageUtils";

interface MediaViewerProps {
  item: MediaItem | null;
}

const MediaViewer: React.FC<MediaViewerProps> = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const handleItemSelected = (event: CustomEvent<{ item: MediaItem }>) => {
      setSelectedItem(event.detail.item);
      setEditedName(event.detail.item.name);
      setIsOpen(true);
    };

    document.addEventListener(
      "item:selected",
      handleItemSelected as EventListener
    );

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener(
        "item:selected",
        handleItemSelected as EventListener
      );
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (!selectedItem || editedName.trim() === "") return;

    setIsSaving(true);
    // Astro.callAction is not available in React components; use fetch to call an API route
    const response = await fetch("/api/updateFileDescriptor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: selectedItem.id,
        displayName: editedName,
      }),
    });
    const { success } = await response.json();

    if (success) {
      const updatedItem = {
        ...selectedItem,
        name: editedName,
      };

      setSelectedItem(updatedItem);
      setIsEditing(false);

      // Use the shared utility function to dispatch the event
      dispatchMediaUpdatedEvent(updatedItem);
    } else {
      alert("Failed to update file name. Please try again.");
    }

    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditedName(selectedItem?.name || "");
    setIsEditing(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (!selectedItem || !isOpen) {
    return null;
  }

  const imageId = getImageId(selectedItem.url);

  return (
    <div
      className="fixed inset-0 bg-gray-100 bg-opacity-15 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
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

          <div className="flex-grow overflow-hidden bg-gray-100 relative">
            <div className="bg-black flex items-center justify-center overflow-hidden">
              {selectedItem.mediaType === "IMAGE" ? (
                <Image
                  uri={imageId}
                  width={1500}
                  height={1500}
                  displayMode="fit"
                  containerWidth={800}
                  containerHeight={400}
                  isInFirstFold={true}
                  isSEOBot={false}
                  shouldUseLQIP={true}
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

          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleNameChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow mr-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-800 truncate flex-grow">
                    {selectedItem.name}
                  </h4>
                  <button
                    onClick={handleEditClick}
                    className="text-gray-500 hover:text-blue-600 ml-2"
                    title="Edit name"
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              )}
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
            </div>

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
