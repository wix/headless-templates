import type { APIRoute } from "astro";
import { loadStoryEvents } from "../../lib/wix-events";

export const prerender = false;

export const GET: APIRoute = async () => {
  const events = await loadStoryEvents();

  return Response.json({ events });
};
