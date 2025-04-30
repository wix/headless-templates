import React, { useState, useCallback, useEffect } from "react";
import type { MediaItem } from "../types";
import MediaUploader from "./MediaUploader";
import MediaCatalog from "./MediaCatalog";
import MediaViewer from "./MediaViewer";
import { files } from "@wix/media";

const MediaManager: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch media files from Wix Media Manager
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await files.listFiles();

      if (response.files) {
        const items: MediaItem[] = response.files.map((file) => ({
          id: file._id || "",
          name: file.displayName || "",
          type: file.mediaType?.toLowerCase().includes("image")
            ? "image/jpeg"
            : "video/mp4",
          url: file.url || "",
          uploadDate: file._updatedDate?.toString() || new Date().toISOString(),
          thumbnailUrl: file.thumbnailUrl || "",
        }));
        setMediaItems(items);
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load media files on component mount
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const handleUpload = useCallback((file: any) => {
    // After successful upload to Wix, refresh the list
    fetchMediaFiles();
    setShowUploadModal(false);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await files.bulkDeleteFiles([id]);

        // After deletion, refresh the list
        fetchMediaFiles();

        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    [selectedItem]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Action bar with filters and upload button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="font-medium text-gray-700">All Media</div>
              <div className="text-sm text-gray-500">
                {mediaItems.length} item{mediaItems.length !== 1 ? "s" : ""}
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Media
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Catalog - Takes 3 columns on large screens */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-40 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MediaCatalog
                items={mediaItems}
                onSelect={setSelectedItem}
                onDelete={handleDelete}
                selectedId={selectedItem?.id}
              />
            )}
          </div>

          {/* Preview panel - Takes 1 column on large screens */}
          <div className="bg-white rounded-lg shadow-md">
            <MediaViewer item={selectedItem} />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Upload Media
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
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
            <MediaUploader onUpload={handleUpload} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
