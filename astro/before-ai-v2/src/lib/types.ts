/** One upcoming event, flattened from the Wix Events API for the desktop UI. */
export type StoryEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  icon: string;
  imageUrl?: string;
  status: string;
  summary: string;
  eventPageUrl?: string;
};
