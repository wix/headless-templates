import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { defineAction } from "astro:actions";

export const server = {
  fetchMediaItems: defineAction({
    handler: async () => {
      let mediaItems;
      let isLoading = true;

      try {
        const elevatedListFiles = auth.elevate(files.listFiles);
        const { files: listFiles } = await elevatedListFiles();

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
        await auth.elevate(files.bulkDeleteFiles)([fileId]);

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
        const result = await auth.elevate(files.generateFileUploadUrl)(
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
        const { state } = await auth.elevate(files.updateFileDescriptor)({
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
