import { useState } from "react"
import { 
  Images, 
  FolderOpen, 
  Heart, 
  Trash2, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Upload,
  LogOut,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/auth-context"
import { ViewMode } from "@/types/gallery"
import { cn } from "@/lib/utils"

interface GallerySidebarProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  photoCount: number
  albumCount: number
  favoriteCount: number
  trashCount: number
}

const menuItems = [
  { id: 'all-photos' as ViewMode, label: 'Tất cả ảnh', icon: Images },
  { id: 'albums' as ViewMode, label: 'Albums', icon: FolderOpen },
  { id: 'favorites' as ViewMode, label: 'Yêu thích', icon: Heart },
  { id: 'trash' as ViewMode, label: 'Thùng rác', icon: Trash2 },
]

export function GallerySidebar({
  currentView,
  onViewChange,
  photoCount,
  albumCount,
  favoriteCount,
  trashCount
}: GallerySidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const getCounts = (viewId: ViewMode) => {
    switch (viewId) {
      case 'all-photos': return photoCount
      case 'albums': return albumCount
      case 'favorites': return favoriteCount
      case 'trash': return trashCount
      default: return 0
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gallery-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">SoulSnap</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-gallery-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDoKp0wum3Z8G1cQXa7j9UtFbpTYqG5YhUcg&s'} alt={user.username} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.username}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="p-4">
        <Button className="w-full" variant="default">
          <Upload className="h-4 w-4 mr-2" />
          Tải ảnh lên
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-11 px-3",
                  currentView === item.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover" 
                    : "hover:bg-gallery-hover"
                )}
                onClick={() => {
                  onViewChange(item.id)
                  setIsMobileOpen(false)
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {getCounts(item.id)}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-gallery-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 mr-3" />
          ) : (
            <Moon className="h-4 w-4 mr-3" />
          )}
          {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-gallery-surface shadow-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-72 bg-gallery-surface border-r border-gallery-border transition-transform duration-300 md:relative md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}