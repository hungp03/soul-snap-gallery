import { useState } from "react"
import { Heart, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Photo } from "@/types/gallery"
import { PhotoModal } from "./photo-modal"
import { ConfirmDialog } from "./confirm-dialog"

interface PhotoGridProps {
  photos: Photo[]
  onFavoriteToggle: (photoId: number) => void
  onDeleteToggle: (photoId: number) => void
  onRestore: (photoId: number) => void
  showDeleted?: boolean
  onPermanentDelete?: (photoId: number) => void
}

export function PhotoGrid({
  photos,
  onFavoriteToggle,
  onDeleteToggle,
  onRestore,
  showDeleted = false,
  onPermanentDelete,
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
            key={photo.photoId}
            className="group relative aspect-square bg-gallery-surface rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Ảnh */}
            <img
              src={photo.thumbnailUrl}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
              <div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {!showDeleted && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => onFavoriteToggle(photo.photoId)}
                  >
                    {photo.isFavorite ? (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {showDeleted ? (
                  <>
                    <ConfirmDialog
                      title="Khôi phục ảnh?"
                      description="Ảnh sẽ được khôi phục lại từ thùng rác."
                      confirmText="Khôi phục"
                      onConfirm={() => onRestore(photo.photoId)}
                      trigger={
                        <Button size="icon" variant="secondary" className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      title="Xóa vĩnh viễn?"
                      description="Ảnh này sẽ bị xóa hoàn toàn và không thể khôi phục."
                      variant="destructive"
                      confirmText="Xóa"
                      onConfirm={() => onPermanentDelete?.(photo.photoId)}
                      trigger={
                        <Button size="icon" variant="destructive" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </>
                ) : (
                  <ConfirmDialog
                    title="Chuyển ảnh vào thùng rác?"
                    description="Ảnh sẽ được di chuyển vào thùng rác và có thể khôi phục lại sau."
                    confirmText="Đồng ý"
                    onConfirm={() => onDeleteToggle(photo.photoId)}
                    trigger={
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

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
          onFavoriteToggle={(id) => onFavoriteToggle(Number(id))}
          onDeleteToggle={(id) => onDeleteToggle(Number(id))}
          onRestore={(id) => onRestore(Number(id))}
          showDeleted={showDeleted}
        />
      )}
    </>
  )
}
