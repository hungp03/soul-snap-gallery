import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface CreateAlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAlbum: (name: string, description?: string) => Promise<void>
}

export function CreateAlbumModal({ isOpen, onClose, onCreateAlbum }: CreateAlbumModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    try {
      setIsCreating(true)
      await onCreateAlbum(name.trim(), description.trim() || undefined)
      setName("")
      setDescription("")
      onClose()
    } catch (error) {
      console.error("Error creating album:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setName("")
      setDescription("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo album mới</DialogTitle>
          <DialogDescription>
            Tạo một album mới để tổ chức ảnh của bạn.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên album *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nhập tên album..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả cho album..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo album
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}