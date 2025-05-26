import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { defineAction } from "astro:actions";
// import { data } from "@wix/data";

const VISITOR_UPLOADS_FOLDER_ID = "visitor-uploads";
// const MEDIA_COLLECTION_NAME = "MediaItems";

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

        if (listFiles?.length > 0) {
          // Get all CMS items
          // const elevatedQueryItems = auth.elevate(data.queryItems);
          // const { items: cmsItems } = await elevatedQueryItems({
          //   collectionName: MEDIA_COLLECTION_NAME,
          // });

          // // Create a map of fileId to description
          // const descriptionMap = new Map(
          //   cmsItems.map((item: any) => [item.fileId, item.description])
          // );

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
              // description: descriptionMap.get(id) || "",
              // description: "My",
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

        // if (result?.uploadUrl) {
        //   // Create a CMS item with the description
        //   const elevatedCreateItem = auth.elevate(data.createItem);
        //   await elevatedCreateItem({
        //     collectionName: MEDIA_COLLECTION_NAME,
        //     item: {
        //       title: fileName,
        //       description: description || "",
        //       fileId: result.fileId,
        //       uploadDate: new Date().toISOString(),
        //     },
        //   });
        // }

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
};
