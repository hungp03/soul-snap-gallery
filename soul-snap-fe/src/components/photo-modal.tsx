import { useEffect } from "react"
import { X, Heart, Trash2, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Photo } from "@/types/gallery"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "./confirm-dialog"

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onFavoriteToggle: (photoId: string) => void
  onDeleteToggle: (photoId: string) => void
  onRestore: (photoId: string) => void
  onPermanentDelete?: (photoId: string) => void
  showDeleted?: boolean
}

export function PhotoModal({
  photo,
  onClose,
  onFavoriteToggle,
  onDeleteToggle,
  onRestore,
  onPermanentDelete,
  showDeleted = false,
}: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-medium">{photo.title}</h2>
              <div className="text-white/70 text-sm">
                {new Date(photo.createdAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showDeleted && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => onFavoriteToggle(String(photo.photoId))}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      photo.isFavorite && "fill-red-500 text-red-500"
                    )}
                  />
                </Button>
              )}

              <a
                href={photo.fileUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </a>


              {showDeleted ? (
                <>
                  <ConfirmDialog
                    title="Khôi phục ảnh?"
                    description="Ảnh sẽ được khôi phục lại từ thùng rác."
                    confirmText="Khôi phục"
                    onConfirm={() => {
                      onRestore(String(photo.photoId))
                      onClose()
                    }}
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    }
                  />


                  <ConfirmDialog
                    title="Xóa vĩnh viễn?"
                    description="Ảnh này sẽ bị xóa hoàn toàn và không thể khôi phục."
                    confirmText="Xóa"
                    variant="destructive"
                    onConfirm={() => {
                      onPermanentDelete?.(String(photo.photoId))
                      onClose()
                    }}
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        className=" hover:bg-white/20 text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    }
                  />
                </>
              ) : (
                <ConfirmDialog
                  title="Chuyển ảnh vào thùng rác?"
                  description="Ảnh sẽ được di chuyển vào thùng rác và có thể khôi phục lại sau."
                  confirmText="Đồng ý"
                  onConfirm={() => {
                    onDeleteToggle(String(photo.photoId))
                    onClose()
                  }}
                  trigger={
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  }
                />
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

        <div className="flex-1 flex items-center justify-center p-4 pt-20">
          <img
            src={photo.fileUrl}
            alt={photo.title}
            className="max-h-[calc(100vh-8rem)] max-w-[calc(100vw-8rem)] object-contain rounded-lg"
            loading="lazy"
          />
        </div>

      </div>
    </div>
  )
}
