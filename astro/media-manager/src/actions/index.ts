import { defineAction } from "astro:actions";
import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { createClient, ApiKeyStrategy } from "@wix/sdk";

import.meta.env.API_KEY;

const { API_KEY, SITE_ID, ACCOUNT_ID } = import.meta.env;

const myWixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: API_KEY,
    siteId: SITE_ID,
    accountId: ACCOUNT_ID,
  }),
  modules: {
    files,
  },
});

export const server = {
  listFiles: defineAction({
    handler: async () => {
      try {
        const listOptions = {
          mediaTypes: ["IMAGE"] as any,
        };
        // const elevatedListFiles = auth.elevate(files.listFiles);
        // const images = await elevatedListFiles(listOptions);
        const images = await myWixClient.files.listFiles(listOptions);

        console.log(images);

        return { files: images.files };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to list files");
      }
    },
  }),
  fetchMediaItems: defineAction({
    handler: async () => {
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
      let mediaItems = [];
      let isLoading = true;
      try {
        // const elevatedListFiles = auth.elevate(files.listFiles);
        // const response = await elevatedListFiles();
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
        mediaItems = mockMediaItems;
      } finally {
        isLoading = false;
      }
      return { mediaItems, isLoading };
    },
  }),
  deleteMediaFile: defineAction({
    handler: async ({ fileId }) => {
      try {
        const elevatedBulkDelete = auth.elevate(files.bulkDeleteFiles);
        await elevatedBulkDelete([fileId]);
        return true;
      } catch (error) {
        return false;
      }
    },
  }),
  uploadMediaFile: defineAction({
    handler: async ({ file }) => {
      try {
        const elevatedGenerateUrl = auth.elevate(files.generateFileUploadUrl);
        const response = await elevatedGenerateUrl(file.type, {
          fileName: file.name,
        });
        // The actual upload via XMLHttpRequest should be handled client-side after getting the URL
        return { uploadUrl: response.uploadUrl };
      } catch (error) {
        throw new Error("Error uploading file");
      }
    },
  }),
  updateFileDescriptor: defineAction({
    handler: async ({ fileId, displayName }) => {
      try {
        const elevatedUpdate = auth.elevate(files.updateFileDescriptor);
        await elevatedUpdate({ _id: fileId, displayName });
        return true;
      } catch (error) {
        console.error("Error updating file descriptor:", error);
        return false;
      }
    },
  }),
};
