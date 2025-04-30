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

  // Fetch media files from Wix Media Manager
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await files.listFiles({
        mediaTypes: ["IMAGE", "VIDEO"],
        paging: { limit: 50 },
        sort: { fieldName: "updatedDate", order: "DESC" },
      });

      if (response.files) {
        const items: MediaItem[] = response.files.map((file) => ({
          id: file._id || file.id,
          name: file.displayName,
          type: file.mediaType.toLowerCase().includes("image")
            ? "image/jpeg"
            : "video/mp4",
          url: file.url,
          uploadDate:
            file._updatedDate?.toString() ||
            file.updatedDate?.toString() ||
            new Date().toISOString(),
          thumbnailUrl: file.thumbnailUrl,
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
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await files.bulkDeleteFiles({
          fileIds: [id],
          permanently: false, // Send to trash bin
        });

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <MediaUploader onUpload={handleUpload} />
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
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
      <div className="bg-white rounded-lg shadow p-4">
        <MediaViewer item={selectedItem} />
      </div>
    </div>
  );
};

export default MediaManager;
