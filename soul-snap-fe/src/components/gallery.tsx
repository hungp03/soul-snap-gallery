import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GallerySidebar } from "./gallery-sidebar"
import { PhotoGrid } from "./photo-grid"
import { AlbumGrid } from "./album-grid"
import { ViewMode, Photo, Album } from "@/types/gallery"
import { mockPhotos, mockAlbums } from "@/data/mockData"

export function Gallery() {
  const [currentView, setCurrentView] = useState<ViewMode>('all-photos')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos)
  const [albums] = useState<Album[]>(mockAlbums)

  const handleFavoriteToggle = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, isFavorite: !photo.isFavorite }
        : photo
    ))
  }

  const handleDeleteToggle = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, isDeleted: !photo.isDeleted }
        : photo
    ))
  }

  const handleRestore = (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, isDeleted: false }
        : photo
    ))
  }

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
  }

  const getFilteredPhotos = () => {
    switch (currentView) {
      case 'all-photos':
        return photos.filter(p => !p.isDeleted)
      case 'favorites':
        return photos.filter(p => p.isFavorite && !p.isDeleted)
      case 'trash':
        return photos.filter(p => p.isDeleted)
      default:
        return []
    }
  }

  const getViewTitle = () => {
    if (selectedAlbum) {
      return selectedAlbum.name
    }
    
    switch (currentView) {
      case 'all-photos':
        return 'Tất cả ảnh'
      case 'albums':
        return 'Albums'
      case 'favorites':
        return 'Yêu thích'
      case 'trash':
        return 'Thùng rác'
      default:
        return ''
    }
  }

  const renderContent = () => {
    if (currentView === 'albums') {
      if (selectedAlbum) {
        return (
          <PhotoGrid
            photos={selectedAlbum.photos.filter(p => !p.isDeleted)}
            onFavoriteToggle={handleFavoriteToggle}
            onDeleteToggle={handleDeleteToggle}
            onRestore={handleRestore}
            showDeleted={false}
          />
        )
      }
      return (
        <AlbumGrid
          albums={albums}
          onAlbumSelect={handleAlbumSelect}
        />
      )
    }

    return (
      <PhotoGrid
        photos={getFilteredPhotos()}
        onFavoriteToggle={handleFavoriteToggle}
        onDeleteToggle={handleDeleteToggle}
        onRestore={handleRestore}
        showDeleted={currentView === 'trash'}
      />
    )
  }

  const photoCount = photos.filter(p => !p.isDeleted).length
  const favoriteCount = photos.filter(p => p.isFavorite && !p.isDeleted).length
  const trashCount = photos.filter(p => p.isDeleted).length

  return (
    <div className="flex h-screen bg-gallery-bg">
      <GallerySidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view)
          setSelectedAlbum(null)
        }}
        photoCount={photoCount}
        albumCount={albums.length}
        favoriteCount={favoriteCount}
        trashCount={trashCount}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gallery-surface border-b border-gallery-border px-6 py-4">
          <div className="flex items-center gap-4">
            {selectedAlbum && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToAlbums}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl font-semibold text-foreground">
              {getViewTitle()}
            </h1>
            {selectedAlbum && (
              <span className="text-muted-foreground">
                {selectedAlbum.photoCount} ảnh
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}