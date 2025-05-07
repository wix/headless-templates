import { auth } from "@wix/essentials";
import { files } from "@wix/media";
import { webMethod, Permissions } from "@wix/web-methods";

export const listFiles = webMethod(Permissions.Anyone, async () => {
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
});
