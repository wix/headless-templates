import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { ApiKeyStrategy, createClient } from "@wix/sdk";
import { defineAction } from "astro:actions";

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
  fetchMediaItems: defineAction({
    handler: async () => {
      let mediaItems;
      let isLoading = true;

      try {
        // const elevatedListFiles = auth.elevate(files.listFiles);
        // const response = await elevatedListFiles();
        const { files: listFiles } = await myWixClient.files.listFiles();

        if (listFiles?.length > 0) {
          mediaItems = listFiles.map((file) => {
            const {
              _id: id,
              displayName: name,
              mediaType,
              url,
              _createdDate,
            } = file;

            return {
              id,
              name,
              mediaType,
              url,
              _createdDate,
            };
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoading = false;
      }

      return { mediaItems, isLoading };
    },
  }),
  deleteMediaFile: defineAction({
    handler: async ({ fileId }) => {
      try {
        await myWixClient.files.bulkDeleteFiles([fileId]);

        return true;
      } catch (error) {
        console.error("Error deleting file:", error);
        return false;
      }
    },
  }),
  uploadMediaFile: defineAction({
    handler: async ({ mimeType, options }) => {
      console.log({ mimeType, options });
      try {
        const result = await myWixClient.files.generateFileUploadUrl(
          mimeType,
          options
        );
        return result;
      } catch (error) {
        console.error("Error generating upload URL:", error);
        return false;
      }
    },
  }),
  updateFileDescriptor: defineAction({
    handler: async ({ fileId, displayName }) => {
      try {
        // const elevatedUpdate = auth.elevate(files.updateFileDescriptor);
        // await elevatedUpdate({ _id: fileId, displayName });

        const { state } = await myWixClient.files.updateFileDescriptor({
          _id: fileId,
          displayName,
        });

        return state === "OK";
      } catch (error) {
        console.error("Error updating file descriptor:", error);
        return false;
      }
    },
  }),
};
