import React, { useCallback, useState } from "react";
import { files } from "@wix/media";

interface MediaUploaderProps {
  onUpload: (file: any) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToWixMedia = async (file: File) => {
    try {
      setIsUploading(true);
      // Generate upload URL using Wix Media SDK
      const response = await files.generateFileUploadUrl(file.type, {
        fileName: file.name,
      });

      // Upload the file to the generated URL
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "PUT",
        response.uploadUrl + "?filename=" + encodeURIComponent(file.name)
      );
      xhr.setRequestHeader("Content-Type", file.type);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseData = JSON.parse(xhr.responseText);
          onUpload(responseData.file);
          setIsUploading(false);
          setUploadProgress(0);
        } else {
          console.error("Upload failed:", xhr.statusText);
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        console.error("Upload error");
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.send(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        uploadToWixMedia(file);
      }
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        uploadToWixMedia(file);
        e.target.value = ""; // Reset input
      }
    },
    [onUpload]
  );

  return (
    <div
      className="border-2 border-dashed border-secondary/30 rounded-lg p-6 text-center hover:border-primary transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
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
          className="w-12 h-12 text-secondary mb-4"
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
        <span className="text-secondary">
          {isUploading
            ? `Uploading... ${uploadProgress}%`
            : "Drag and drop files here, or click to select files"}
        </span>
        <span className="text-sm text-secondary/70 mt-2">
          Supports images and videos
        </span>
      </label>
      {isUploading && (
        <div className="w-full mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
