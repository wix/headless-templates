import { defineAction } from "astro:actions";
import { auth } from "@wix/essentials";
import { files } from "@wix/media";

export const server = {
  listFiles: defineAction({
    handler: async () => {
      try {
        const listOptions = {
          mediaTypes: ["IMAGE"] as any,
        };
        const elevatedListFiles = auth.elevate(files.listFiles);
        const images = await elevatedListFiles(listOptions);

        return { files: images.files };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to list files");
      }
    },
  }),
};
