export interface Photo {
  id: string
  title: string
  url: string
  thumbnail: string
  dateAdded: string
  size: string
  isFavorite: boolean
  isDeleted: boolean
  albumId?: string
}

export interface Album {
  id: string
  name: string
  coverImage: string
  photoCount: number
  dateCreated: string
  photos: Photo[]
}

export type ViewMode = 'all-photos' | 'albums' | 'favorites' | 'trash'