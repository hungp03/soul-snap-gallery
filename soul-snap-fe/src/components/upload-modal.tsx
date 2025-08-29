import { useState, useRef } from "react"
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SelectedFile {
  file: File
  preview: string
  id: string
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles: SelectedFile[] = []
    const remainingSlots = 10 - selectedFiles.length

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        newFiles.push({ file, preview, id })
      }
    }

    if (files.length > remainingSlots) {
      toast({
        title: "Giới hạn ảnh",
        description: `Chỉ có thể upload tối đa 10 ảnh. ${remainingSlots} ảnh đã được thêm.`,
        variant: "destructive"
      })
    }

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Không có ảnh",
        description: "Vui lòng chọn ít nhất một ảnh để upload.",
        variant: "destructive"
      })
      return
    }

    // Mock upload - in real app, this would upload to backend
    toast({
      title: "Upload thành công",
      description: `Đã upload ${selectedFiles.length} ảnh.`,
    })

    // Clean up preview URLs
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setSelectedFiles([])
    onClose()
  }

  const handleClose = () => {
    // Clean up preview URLs
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setSelectedFiles([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload ảnh ({selectedFiles.length}/10)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
              }
              ${selectedFiles.length >= 10 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => selectedFiles.length < 10 && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={selectedFiles.length >= 10}
            />
            
            <div className="space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {selectedFiles.length >= 10 
                    ? "Đã đạt giới hạn 10 ảnh" 
                    : "Kéo thả ảnh vào đây hoặc click để chọn"
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Hỗ trợ: JPG, PNG, GIF (Tối đa 10 ảnh)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedFiles.map((selectedFile) => (
                  <div key={selectedFile.id} className="relative group mt-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={selectedFile.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(selectedFile.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/50 text-white text-xs px-1 py-0.5 rounded truncate">
                        {selectedFile.file.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <div className="flex gap-2">
              {selectedFiles.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview))
                    setSelectedFiles([])
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              )}
              <Button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}