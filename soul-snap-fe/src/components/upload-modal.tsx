"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useGallery } from "@/contexts/gallery-context";
import { uploadPhotos } from "@/lib/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { albums, isLoading, refreshPhotos } = useGallery();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: SelectedFile[] = [];
    const remainingSlots = 10 - selectedFiles.length;

    const oversizeNames: string[] = [];

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        oversizeNames.push(file.name);
        continue;
      }

      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        newFiles.push({ file, preview, id });
      }
    }

    if (oversizeNames.length) {
      toast({
        title: "Ảnh vượt quá 10MB",
        description: `Các ảnh sau không được thêm: ${oversizeNames.join(", ")}`,
        variant: "destructive",
      });
    }

    if (files.length > remainingSlots) {
      toast({
        title: "Giới hạn ảnh",
        description: `Chỉ có thể upload tối đa 10 ảnh. ${remainingSlots} ảnh đã được thêm.`,
        variant: "destructive",
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedAlbumId) {
      toast({
        title: "Chưa chọn album",
        description: "Vui lòng chọn một album để upload ảnh vào.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Không có ảnh",
        description: "Vui lòng chọn ít nhất một ảnh để upload.",
        variant: "destructive",
      });
      return;
    }

    const oversize = selectedFiles.filter((f) => f.file.size > MAX_FILE_SIZE);
    if (oversize.length) {
      toast({
        title: "Có ảnh vượt quá 10MB",
        description: `Hãy xoá ảnh quá dung lượng: ${oversize.map((f) => f.file.name).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const filesToUpload = selectedFiles.map(sf => sf.file);
      await uploadPhotos(filesToUpload, parseInt(selectedAlbumId));
      
      toast({
        title: "Upload thành công",
        description: `Đã upload ${selectedFiles.length} ảnh vào album.`,
      });

      // Refresh the photos list in gallery context
      if (refreshPhotos) {
        refreshPhotos();
      }

      // Clean up and close modal
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);
      setSelectedAlbumId("");
      onClose();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle specific error cases
      let errorMessage = "Có lỗi xảy ra khi upload ảnh.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 413) {
        errorMessage = "Có file vượt quá 10MB. Vui lòng kiểm tra lại.";
      } else if (error.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ. Vui lòng thử lại.";
      }
      
      toast({
        title: "Upload thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      toast({
        title: "Đang upload",
        description: "Vui lòng đợi upload hoàn tất.",
        variant: "destructive",
      });
      return;
    }
    
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setSelectedAlbumId("");
    onClose();
  };

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
          <div className="flex items-center gap-3">
            <div className="min-w-[120px] text-sm font-medium">Chọn album</div>
            <Select
              value={selectedAlbumId}
              onValueChange={(v) => setSelectedAlbumId(v)}
              disabled={isLoading || isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Đang tải album..." : "Chọn album"} />
              </SelectTrigger>
              <SelectContent>
                {albums.map((a) => (
                  <SelectItem key={a.albumId} value={String(a.albumId)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              ${selectedFiles.length >= 10 || isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && selectedFiles.length < 10 && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={selectedFiles.length >= 10 || isUploading}
            />
            <div className="space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isUploading 
                    ? "Đang upload..." 
                    : selectedFiles.length >= 10 
                      ? "Đã đạt giới hạn 10 ảnh" 
                      : "Kéo thả ảnh vào đây hoặc click để chọn"
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Hỗ trợ: JPG, PNG, GIF (Tối đa 10 ảnh, mỗi ảnh ≤ 10MB) 
                </p>
              </div>
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedFiles.map((sf) => (
                  <div key={sf.id} className="relative group mt-2">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={sf.preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(sf.id)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/50 text-white text-xs px-1 py-0.5 rounded truncate">
                        {sf.file.name}
                      </div>
                     
                      {sf.file.size > MAX_FILE_SIZE && (
                        <div className="bg-red-500/80 text-white text-[10px] mt-1 px-1 py-0.5 rounded">
                          Có file lớn hơn 10MB — không thể upload
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Hủy
            </Button>
            <div className="flex gap-2">
              {selectedFiles.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                    setSelectedFiles([]);
                  }}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              )}
              <Button 
                onClick={handleUpload} 
                disabled={selectedFiles.length === 0 || !selectedAlbumId || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Đang upload..." : `Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ""}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}