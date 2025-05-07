import type { MediaItem } from "../types";
import { files } from "@wix/media";
import { multiply } from "../backend/my-web-method.web.js";

export async function fetchMediaItems(): Promise<{
  mediaItems: MediaItem[];
  isLoading: boolean;
}> {
  const mockMediaItems = [
    {
      id: "1",
      name: "Acme Circles T-Shirt",
      mediaType: "IMAGE",
      url: "https://static.wixstatic.com/media/8dfd06_3e3feaf389cf47fd9c781e5977a89c3d~mv2.png",
      _createdDate: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Acme Baby Cap",
      mediaType: "IMAGE",
      url: "https://static.wixstatic.com/media/8dfd06_2a67ecfa18c94f25bb01709559f1351e~mv2.png",
      _createdDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      name: "Acme Dog Sweater",
      mediaType: "IMAGE",
      url: "https://static.wixstatic.com/media/8dfd06_b20ae557929844e58f2f2d1e0071d167~mv2.png",
      _createdDate: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  let mediaItems: MediaItem[] = [];
  let isLoading = true;

  const res = await multiply(1, 2);
  console.log({ res });

  try {
    // const response = await files.listFiles();

    // if (response.files?.length > 0) {
    //   mediaItems = response.files.map((file) => ({
    //     id: file._id || "",
    //     name: file.displayName || "",
    //     mediaType: file.mediaType ? "IMAGE" : "VIDEO",
    //     url: file.url || "",
    //     _createdDate: file._createdDate?.toString() || new Date().toISOString(),
    //     thumbnailUrl: file.thumbnailUrl || "",
    //   }));
    // } else {
    //   mediaItems = mockMediaItems;
    // }
    mediaItems = mockMediaItems;
  } catch (error) {
    // console.error("Error fetching media items:", error);
    mediaItems = mockMediaItems;
  } finally {
    isLoading = false;
  }

  return { mediaItems, isLoading };
}

export async function deleteMediaFile(fileId: string): Promise<boolean> {
  try {
    await files.bulkDeleteFiles([fileId]);
    return true;
  } catch (error) {
    return false;
  }
}

export async function uploadMediaFile(
  file: File,
  onProgress: (percent: number) => void
): Promise<any> {
  try {
    const response = await files.generateFileUploadUrl(file.type, {
      fileName: file.name,
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "PUT",
        response.uploadUrl + "?filename=" + encodeURIComponent(file.name)
      );
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload error"));
      };

      xhr.send(file);
    });
  } catch (error) {
    throw new Error("Error uploading file");
  }
}

export async function updateFileDescriptor(
  fileId: string,
  displayName: string
): Promise<boolean> {
  try {
    await files.updateFileDescriptor({
      _id: fileId,
      displayName,
    });
    return true;
  } catch (error) {
    console.error("Error updating file descriptor:", error);
    return false;
  }
}
