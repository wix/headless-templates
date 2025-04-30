import React, { useCallback, useState } from "react";
import { files } from "@wix/media";

interface MediaUploaderProps {
  onUpload: (file: any) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const uploadToWixMedia = async (file: File) => {
    try {
      setIsUploading(true);
      // Generate upload URL using Wix Media SDK
      const response = await files.generateFileUploadUrl(file.type, {
        fileName: file.name,
      });

      // Upload the file to the generated URL
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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

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
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
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
        {isUploading ? (
          // Upload progress UI
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 mb-4 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
            <p className="text-gray-700 mb-3 font-medium">
              Uploading... {uploadProgress}%
            </p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Please wait</p>
          </div>
        ) : (
          // Upload prompt UI
          <>
            <div className="w-20 h-20 mb-4 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 border border-blue-100">
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-2">
              Drag and drop your files here
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Supports JPG, PNG, GIF, MP4, and more
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
              Browse Files
            </button>
          </>
        )}
      </label>
    </div>
  );
};

export default MediaUploader;
