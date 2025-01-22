import { z } from "astro/zod";

export const wixBlogLoaderSchema = z.object({
  id: z.string(),
  data: z.any(), // TODO: infer the schema from wix sdk
});
