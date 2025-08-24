import { FolderOpen, Images } from "lucide-react"
import { Album } from "@/types/gallery"
import { cn } from "@/lib/utils"

interface AlbumGridProps {
  albums: Album[]
  onAlbumSelect: (album: Album) => void
}

export function AlbumGrid({ albums, onAlbumSelect }: AlbumGridProps) {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Chưa có album nào</h3>
        <p className="text-muted-foreground">
          Tạo album đầu tiên để tổ chức ảnh của bạn
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {albums.map((album) => (
        <div
          key={album.id}
          className="group cursor-pointer"
          onClick={() => onAlbumSelect(album)}
        >
          <div className="relative aspect-square bg-gallery-surface rounded-lg overflow-hidden mb-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <img
              src={album.coverImage}
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Photo count overlay */}
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
              {album.photoCount} ảnh • {album.dateCreated}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}