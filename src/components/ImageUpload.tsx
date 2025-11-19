import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClear: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [onImageSelect]);

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onClear();
  }, [previewUrl, onClear]);

  return (
    <Card className="p-6 border-2 border-dashed transition-colors duration-200">
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center min-h-[300px] transition-colors duration-200 ${
            isDragging ? "bg-primary/5" : ""
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Medical Image</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drag and drop your medical image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG formats
              </p>
            </div>
            <label htmlFor="file-upload">
              <Button variant="default" className="cursor-pointer" asChild>
                <span>Select Image</span>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{selectedImage.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-[400px] object-contain bg-muted"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
