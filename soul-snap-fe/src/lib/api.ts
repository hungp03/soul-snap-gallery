// src/lib/api.ts
import api from '@/lib/axios'
import type { Album, PaginationResult, Photo } from '@/types/gallery'

export async function getAlbums(params?: { page?: number; limit?: number }) {
  const res = await api.get<PaginationResult<Album>>('/albums', {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 12,
    },
  })
  return res.data
}

export async function createAlbum(name: string, description?: string) {
  const res = await api.post<Album>('/albums', { name, description })
  return res.data
}

export async function deleteAlbum(albumId: number) {
  const res = await api.delete(`/albums/${albumId}`)
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

export async function uploadPhotos(files: File[], albumId: number, title?: string) {
  const formData = new FormData()
  formData.append('albumId', String(albumId))
  if (title) formData.append('title', title)
  files.forEach((f) => formData.append('files', f))

  const res = await api.post<Photo[]>('/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) {
        const percent = Math.round((e.loaded * 100) / e.total)
        console.log(`Upload Progress: ${percent}%`)
      }
    },
  })
  return res.data
}
