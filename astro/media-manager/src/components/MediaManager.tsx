import React, { useState, useCallback } from "react";
import type { MediaItem } from "../types";
import MediaUploader from "./MediaUploader";
import MediaCatalog from "./MediaCatalog";
import MediaViewer from "./MediaViewer";

const MediaManager: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const handleUpload = useCallback((files: FileList) => {
    const newItems: MediaItem[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString(),
    }));

    setMediaItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    },
    [selectedItem]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <MediaUploader onUpload={handleUpload} />
        <MediaCatalog
          items={mediaItems}
          onSelect={setSelectedItem}
          onDelete={handleDelete}
          selectedId={selectedItem?.id}
        />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <MediaViewer item={selectedItem} />
      </div>
    </div>
  );
};

export default MediaManager;
