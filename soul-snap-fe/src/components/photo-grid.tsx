import { useState } from "react"
import { Heart, Trash2, RotateCcw, HeartOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Photo } from "@/types/gallery"
import { cn } from "@/lib/utils"
import { PhotoModal } from "./photo-modal"

interface PhotoGridProps {
  photos: Photo[]
  onFavoriteToggle: (photoId: string) => void
  onDeleteToggle: (photoId: string) => void
  onRestore: (photoId: string) => void
  showDeleted?: boolean
}

export function PhotoGrid({ 
  photos, 
  onFavoriteToggle, 
  onDeleteToggle, 
  onRestore,
  showDeleted = false 
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Trash2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Không có ảnh nào</h3>
        <p className="text-muted-foreground">
          {showDeleted ? "Thùng rác trống" : "Chưa có ảnh nào được thêm"}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-gallery-surface rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.thumbnail}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                {!showDeleted && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFavoriteToggle(photo.id)
                    }}
                  >
                    {photo.isFavorite ? (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                {showDeleted ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestore(photo.id)
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteToggle(photo.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Favorite indicator */}
            {photo.isFavorite && !showDeleted && (
              <div className="absolute bottom-2 left-2">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onFavoriteToggle={onFavoriteToggle}
          onDeleteToggle={onDeleteToggle}
          onRestore={onRestore}
          showDeleted={showDeleted}
        />
      )}
    </>
  )
}