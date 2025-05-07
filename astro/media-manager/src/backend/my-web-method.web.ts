import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { webMethod, Permissions } from "@wix/web-methods";

export const multiply = webMethod(
  Permissions.Anyone,
  async (a: number, b: number) => {
    try {
      const listOptions = {
        mediaTypes: ["IMAGE"] as any,
      };
      const elevatedListFiles = auth.elevate(files.listFiles);
      const images = await elevatedListFiles(listOptions);

      return images.files;
    } catch (error) {
      console.error(error);
    }

    return a * b;
  }
);
