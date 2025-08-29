export interface Photo {
  photoId: number
  albumId: number
  thumbnailUrl: string
  fileUrl: string
  title: string | null
  isFavorite: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Album {
  albumId: number;
  userId: number;
  name: string;
  description: string | null;
  createdAt: string;   
  updatedAt: string;   
  photoCount: number;
  thumbnailPhoto: null | {
    photoId: number;
    thumbnail: string; 
  };
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ViewMode = 'all-photos' | 'albums' | 'favorites' | 'trash'