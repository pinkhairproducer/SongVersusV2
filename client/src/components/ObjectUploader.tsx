import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, CheckCircle2, XCircle } from "lucide-react";

interface ObjectUploaderProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (uploadUrl: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  allowedFileTypes = ["image/*"],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      alert(`File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadStatus("idle");
    
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const { url } = await onGetUploadParameters();
      
      const response = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadStatus("success");
      const uploadUrl = url.split("?")[0];
      onComplete?.(uploadUrl);
      
      setTimeout(() => {
        setShowModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadStatus("idle");
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-sv-dark border-sv-gray">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedFileTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sv-gray rounded-lg p-8 text-center cursor-pointer hover:border-sv-pink transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Click to select an image</p>
                <p className="text-xs text-gray-500 mt-2">Max size: {Math.round(maxFileSize / 1024 / 1024)}MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative aspect-square max-h-64 mx-auto overflow-hidden rounded-lg">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    disabled={isUploading}
                    className="text-gray-400"
                  >
                    Change
                  </Button>
                </div>

                {uploadStatus === "success" && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Upload successful!</span>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span>Upload failed. Please try again.</span>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadStatus === "success"}
                  className="w-full bg-sv-pink hover:bg-sv-pink/80 text-black font-bold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
