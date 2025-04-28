import React, { useCallback } from "react";

interface MediaUploaderProps {
  onUpload: (files: FileList) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        onUpload(e.dataTransfer.files);
      }
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onUpload(e.target.files);
        e.target.value = ""; // Reset input
      }
    },
    [onUpload]
  );

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        id="fileInput"
        accept="image/*,video/*"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer flex flex-col items-center"
      >
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span className="text-gray-600">
          Drag and drop files here, or click to select files
        </span>
        <span className="text-sm text-gray-500 mt-2">
          Supports images and videos
        </span>
      </label>
    </div>
  );
};

export default MediaUploader;
