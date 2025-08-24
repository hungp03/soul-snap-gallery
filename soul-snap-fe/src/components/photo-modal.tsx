import { useEffect } from "react"
import { X, Heart, Trash2, RotateCcw, Download, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Photo } from "@/types/gallery"
import { cn } from "@/lib/utils"

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onFavoriteToggle: (photoId: string) => void
  onDeleteToggle: (photoId: string) => void
  onRestore: (photoId: string) => void
  showDeleted?: boolean
}

export function PhotoModal({
  photo,
  onClose,
  onFavoriteToggle,
  onDeleteToggle,
  onRestore,
  showDeleted = false
}: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Close overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-medium">{photo.title}</h2>
              <div className="text-white/70 text-sm">
                {photo.dateAdded} • {photo.size}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!showDeleted && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => onFavoriteToggle(photo.id)}
                >
                  <Heart 
                    className={cn(
                      "h-5 w-5",
                      photo.isFavorite && "fill-red-500 text-red-500"
                    )} 
                  />
                </Button>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>

              {showDeleted ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => onRestore(photo.id)}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => onDeleteToggle(photo.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}