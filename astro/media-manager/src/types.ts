export interface MediaItem {
  id: string;
  name: string;
  mediaType: string;
  url: string;
  _createdDate: string;
  thumbnailUrl?: string;
}

export interface UploadResponse {
  file: {
    id: string;
    name: string;
    url: string;
    mediaType: string;
  };
}

export interface MediaApiResponse {
  files: Array<{
    _id: string;
    displayName: string;
    mediaType: string;
    url: string;
    _createdDate?: string;
    thumbnailUrl?: string;
  }>;
}
