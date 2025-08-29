"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import type { Album, Photo, PaginationResult } from "@/types/gallery";

type GalleryContextType = {
  albums: Album[];
  photos: Photo[];
  isLoading: boolean;
  isLoadingPhotos: boolean;
  error: string | null;
  refreshAlbums: (params?: { page?: number; limit?: number }) => Promise<void>;
  refreshPhotos: (params?: { 
    page?: number;
    limit?: number;
    albumId?: number;
    isFavorite?: boolean;
    isDeleted?: boolean;
  }) => Promise<void>;
};

const GalleryContext = createContext<GalleryContextType | null>(null);

export const GalleryProvider = ({ children }: { children: React.ReactNode }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAlbums = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get<PaginationResult<Album>>("/albums", {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 100, // lấy nhiều để đủ cho dropdown
          },
        });
        setAlbums(res.data.data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Fetch albums failed");
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshPhotos = useCallback(
    async (params?: { 
      page?: number;
      limit?: number;
      albumId?: number;
      isFavorite?: boolean;
      isDeleted?: boolean;
    }) => {
      try {
        setIsLoadingPhotos(true);
        setError(null);
        const res = await api.get<PaginationResult<Photo>>("/photos", {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 12,
            albumId: params?.albumId,
            isFavorite: params?.isFavorite,
            isDeleted: params?.isDeleted ?? false,
          },
        });
        setPhotos(res.data.data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Fetch photos failed");
        setPhotos([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    },
    []
  );

  // fetch albums lần đầu
  useEffect(() => {
    refreshAlbums();
  }, [refreshAlbums]);

  return (
    <GalleryContext.Provider 
      value={{ 
        albums, 
        photos, 
        isLoading, 
        isLoadingPhotos, 
        error, 
        refreshAlbums, 
        refreshPhotos 
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used inside GalleryProvider");
  return ctx;
}