import { useEffect, useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GallerySidebar } from "./gallery-sidebar"
import { AlbumGrid } from "./album-grid"
import { PhotoGrid } from "./photo-grid"
import { Pagination } from "./pagination"
import { UploadModal } from "./upload-modal"
import { ViewMode, Album, Photo } from "@/types/gallery"
import {toast} from "sonner"
import { getAlbums, getPhotos, toggleFavorite, toggleSoftDelete, hardDelete } from "@/lib/api"

export function Gallery() {
  const [currentView, setCurrentView] = useState<ViewMode>("all-photos")
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Albums state
  const [albums, setAlbums] = useState<Album[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(false)
  const [errorAlbums, setErrorAlbums] = useState<string | null>(null)

  // Photos state
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [errorPhotos, setErrorPhotos] = useState<string | null>(null)
  const [photosPagination, setPhotosPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Load albums
  useEffect(() => {
    if (currentView !== "albums") return
    let mounted = true
    ;(async () => {
      try {
        setLoadingAlbums(true)
        setErrorAlbums(null)
        const res = await getAlbums({ page: 1, limit: 20 })
        if (mounted) setAlbums(res.data)
      } catch (err: any) {
        if (mounted) setErrorAlbums(err.message ?? "Lỗi tải albums")
      } finally {
        if (mounted) setLoadingAlbums(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [currentView])

  // Load photos (all-photos, favorites, trash)
  useEffect(() => {
    if (currentView === "albums" || selectedAlbum) return // album có API riêng

    let mounted = true
    ;(async () => {
      try {
        setLoadingPhotos(true)
        setErrorPhotos(null)

        const params: any = {
          page: photosPagination.currentPage,
          limit: 12,
        }

        switch (currentView) {
          case "favorites":
            params.isFavorite = true
            break
          case "trash":
            params.isDeleted = true
            break
        }

        const res = await getPhotos(params)
        if (mounted) {
          setPhotos(res.data)
          setPhotosPagination({
            currentPage: res.page,
            totalPages: res.totalPages,
            total: res.total,
          })
        }
      } catch (err: any) {
        if (mounted) setErrorPhotos(err.message ?? "Lỗi tải ảnh")
      } finally {
        if (mounted) setLoadingPhotos(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [currentView, photosPagination.currentPage, selectedAlbum])

  // Chọn album -> gọi API trực tiếp
  const handleAlbumSelect = async (album: Album) => {
    setSelectedAlbum(album)
    try {
      setLoadingPhotos(true)
      setErrorPhotos(null)
      const res = await getPhotos({
        page: 1,
        limit: 18,
        albumId: album.albumId,
      })
      setPhotos(res.data)
      setPhotosPagination({
        currentPage: res.page,
        totalPages: res.totalPages,
        total: res.total,
      })
    } catch (err: any) {
      setErrorPhotos(err.message ?? "Lỗi tải ảnh")
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
    setPhotos([])
    setPhotosPagination({ currentPage: 1, totalPages: 1, total: 0 })
  }

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view)
    setSelectedAlbum(null)
    setPhotosPagination({ currentPage: 1, totalPages: 1, total: 0 })
  }

  const handlePageChange = async (page: number) => {
    setPhotosPagination((prev) => ({ ...prev, currentPage: page }))
    try {
      setLoadingPhotos(true)
      setErrorPhotos(null)
      const res = await getPhotos({
        page,
        limit: selectedAlbum ? 18 : 12,
        albumId: selectedAlbum?.albumId,
        isFavorite: currentView === "favorites" ? true : undefined,
        isDeleted: currentView === "trash" ? true : undefined,
      })
      setPhotos(res.data)
      setPhotosPagination({
        currentPage: res.page,
        totalPages: res.totalPages,
        total: res.total,
      })
    } catch (err: any) {
      setErrorPhotos(err.message ?? "Lỗi tải ảnh")
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleFavoriteToggle = async (photoId: number) => {
    const updatedPhoto = await toggleFavorite(photoId)
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.photoId === updatedPhoto.photoId ? updatedPhoto : photo
      )
    )
    toast.message(updatedPhoto.isFavorite ? "Ảnh đã được thêm vào yêu thích." : "Ảnh đã được gỡ khỏi yêu thích.")
  }

  const refreshPhotos = async () => {
    const res = await getPhotos({
      page: photosPagination.currentPage,
      limit: selectedAlbum ? 18 : 12,
      albumId: selectedAlbum?.albumId,
      isFavorite: currentView === "favorites" ? true : undefined,
      isDeleted: currentView === "trash" ? true : undefined,
    })
    setPhotos(res.data)
    setPhotosPagination({
      currentPage: res.page,
      totalPages: res.totalPages,
      total: res.total,
    })
  }

  const handleDeleteToggle = async (photoId: number) => {
    await toggleSoftDelete(photoId)
    await refreshPhotos()
    toast.message("Ảnh đã được chuyển vào thùng rác.")
  }

  const handlePermanentDelete = async (photoId: number) => {
    await hardDelete(photoId)
    await refreshPhotos()
    toast.message("Ảnh đã được xóa vĩnh viễn.")
  }

  const getViewTitle = () => {
    if (selectedAlbum) return selectedAlbum.name
    switch (currentView) {
      case "albums":
        return "Albums"
      case "all-photos":
        return "Tất cả ảnh"
      case "favorites":
        return "Yêu thích"
      case "trash":
        return "Thùng rác"
      default:
        return ""
    }
  }

  const isShowingPhotos = currentView !== "albums" || selectedAlbum

  return (
    <div className="flex h-screen bg-gallery-bg">
      <GallerySidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gallery-surface border-b border-gallery-border px-6 py-4">
          <div className="flex items-center gap-4">
            {selectedAlbum && (
              <Button variant="ghost" size="icon" onClick={handleBackToAlbums}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-semibold text-foreground">
              {getViewTitle()}
            </h1>
            {isShowingPhotos && photosPagination.total > 0 && (
              <span className="text-sm text-muted-foreground ml-auto">
                {photosPagination.total} ảnh
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {currentView === "albums" && !selectedAlbum ? (
            loadingAlbums ? (
              <div className="flex items-center justify-center h-full p-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : errorAlbums ? (
              <div className="p-6 text-red-600">{errorAlbums}</div>
            ) : (
              <AlbumGrid albums={albums} onAlbumSelect={handleAlbumSelect} />
            )
          ) : (
            <>
              {loadingPhotos ? (
                <div className="flex items-center justify-center h-full p-6">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : errorPhotos ? (
                <div className="p-6 text-red-600">{errorPhotos}</div>
              ) : (
                <PhotoGrid
                  photos={photos}
                  onFavoriteToggle={handleFavoriteToggle}
                  onDeleteToggle={handleDeleteToggle}
                  onRestore={handleDeleteToggle}
                  showDeleted={currentView === "trash"}
                  onPermanentDelete={handlePermanentDelete}
                />
              )}

              {!loadingPhotos && !errorPhotos && (
                <Pagination
                  currentPage={photosPagination.currentPage}
                  totalPages={photosPagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}
