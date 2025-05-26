import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { items } from "@wix/data";
import { defineAction } from "astro:actions";

const VISITOR_UPLOADS_FOLDER_ID = "visitor-uploads";
const MEDIA_COLLECTION_ID = "Medias";

export const server = {
  fetchMediaItems: defineAction({
    handler: async () => {
      let mediaItems;
      let isLoading = true;

      try {
        const elevatedListFiles = auth.elevate(files.listFiles);
        const { files: listFiles } = await elevatedListFiles({
          parentFolderId: VISITOR_UPLOADS_FOLDER_ID,
        });

        if (listFiles && listFiles.length > 0) {
          const elevatedQueryItems = auth.elevate(items.query);
          const { items: cmsItems } =
            await elevatedQueryItems(MEDIA_COLLECTION_ID).find();

          const cmsItemsMap = new Map(
            cmsItems.map((item: any) => [
              item.image,
              {
                id: item._id,
                description: item.description,
              },
            ])
          );

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
              cmsItemId: cmsItemsMap.get(url)?.id,
              description: cmsItemsMap.get(url)?.description || "",
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

  uploadMediaFile: defineAction({
    handler: async ({ mimeType, fileName }) => {
      try {
        const result = await auth.elevate(files.generateFileUploadUrl)(
          mimeType,
          {
            fileName,
            parentFolderId: VISITOR_UPLOADS_FOLDER_ID,
          }
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

  deleteMediaFile: defineAction({
    handler: async ({ fileId, cmsItemId }) => {
      try {
        await auth.elevate(files.bulkDeleteFiles)([fileId]);
        await auth.elevate(items.remove)(MEDIA_COLLECTION_ID, cmsItemId);
        return true;
      } catch (error) {
        console.error("Error deleting file:", error);
        return false;
      }
    },
  }),

  addMediaItem: defineAction({
    handler: async ({ description, image }) => {
      try {
        const elevatedInsert = auth.elevate(items.insert);
        const result = await elevatedInsert(MEDIA_COLLECTION_ID, {
          description,
          image,
        });

        return result;
      } catch (error) {
        console.error("Error inserting media item:", error);
        return false;
      }
    },
  }),
};
