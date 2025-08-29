// src/components/AlbumGrid.tsx
import { FolderOpen, Images, Trash2, Plus } from "lucide-react"
import { Album } from "@/types/gallery"
import { ConfirmDialog } from "./confirm-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AlbumGridProps {
  albums: Album[]
  onAlbumSelect: (album: Album) => void
  onAlbumDelete?: (albumId: number) => void
  onCreateAlbum?: () => void
}

export function AlbumGrid({ albums, onAlbumSelect, onAlbumDelete, onCreateAlbum }: AlbumGridProps) {
  const handleDeleteClick = (e: React.MouseEvent, albumId: number, photoCount: number) => {
    e.stopPropagation() // Prevent album selection
    
    // Check if album has photos
    if (photoCount > 0) {
      toast.warning("Không thể xóa album", {
        description: `Album vẫn còn ${photoCount} ảnh. Vui lòng xóa hết ảnh trong album trước khi xóa album.`
      })
      return
    }
    
    if (onAlbumDelete) {
      onAlbumDelete(albumId)
    }
  }

  if (albums.length === 0) {
    return (
      <div className="p-4">
        {/* Create Album Button - Right aligned */}
        {onCreateAlbum && (
          <div className="flex justify-end mb-6">
            <Button onClick={onCreateAlbum} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo album mới
            </Button>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Chưa có album nào</h3>
          <p className="text-muted-foreground">
            Tạo album đầu tiên để tổ chức ảnh của bạn
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Create Album Button - Right aligned */}
      {onCreateAlbum && (
        <div className="flex justify-end mb-6">
          <Button onClick={onCreateAlbum} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo album mới
          </Button>
        </div>
      )}

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <div
            key={album.albumId}                               
            className="group cursor-pointer"
            onClick={() => onAlbumSelect(album)}
          >
            <div className="relative aspect-square bg-gallery-surface rounded-lg overflow-hidden mb-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <img
                src={album.thumbnailPhoto?.thumbnail ?? '/placeholder.png'} 
                alt={album.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Delete Button - Top right corner on hover */}
              {onAlbumDelete && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {album.photoCount > 0 ? (
                    // Show delete button without dialog if album has photos
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white shadow-md"
                      onClick={(e) => handleDeleteClick(e, album.albumId, album.photoCount)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    // Show delete button with confirmation dialog if album is empty
                    <ConfirmDialog
                      title="Xóa album"
                      description={`Bạn có chắc chắn muốn xóa album "${album.name}"? Hành động này không thể hoàn tác.`}
                      confirmText="Xóa"
                      cancelText="Hủy"
                      variant="destructive"
                      onConfirm={() => handleDeleteClick(new MouseEvent('click') as any, album.albumId, 0)}
                      trigger={
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 bg-red-500/80 hover:bg-red-600 text-white shadow-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  )}
                </div>
              )}

              {/* Photo Count Badge - Bottom right */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                <Images className="h-3 w-3 inline mr-1" />
                {album.photoCount}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {album.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {album.photoCount} ảnh • {new Date(album.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}