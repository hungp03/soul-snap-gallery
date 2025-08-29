import api from '@/lib/axios';
import type { Album, PaginationResult, Photo } from '@/types/gallery';

export async function getAlbums(params?: { page?: number; limit?: number }) {
  const res = await api.get<PaginationResult<Album>>('/albums', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
    },
  })
  return res.data
}

export async function getPhotos(params?: { 
  page?: number
  limit?: number
  albumId?: number
  isFavorite?: boolean
  isDeleted?: boolean
}) {
  const res = await api.get<PaginationResult<Photo>>('/photos', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
      albumId: params?.albumId,
      isFavorite: params?.isFavorite,
      isDeleted: params?.isDeleted ?? false,
    },
  })
  return res.data
}

export async function toggleFavorite(photoId: number) {
  const res = await api.patch(`/photos/${photoId}/favorite`)
  return res.data
}

export async function toggleSoftDelete(photoId: number) {
  const res = await api.patch(`/photos/${photoId}/soft-delete`)
  return res.data
}

export async function hardDelete(photoId: number) {
  const res = await api.delete(`/photos/${photoId}/hard`)
  return res.data
}