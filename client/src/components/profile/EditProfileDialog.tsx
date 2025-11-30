import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Camera, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  currentAvatar: string;
  currentBio: string;
  userName?: string;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  currentAvatar,
  currentBio,
  userName = "User",
}: EditProfileDialogProps) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [bio, setBio] = useState(currentBio);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const response = await fetch("/api/uploads/get-url");
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { url } = await response.json();

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const uploadedUrl = url.split("?")[0];
      setAvatar(uploadedUrl);
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mutation = useMutation({
    mutationFn: () => updateUserProfile(userId, avatar, bio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast({ title: "Profile updated successfully" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const displayAvatar = previewUrl || avatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile picture and bio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-white mb-3 block">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-sv-pink">
                  <AvatarImage src={displayAvatar || undefined} />
                  <AvatarFallback className="bg-sv-dark text-sv-pink text-xl font-bold">
                    {userName[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-avatar-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-sv-pink text-sv-pink hover:bg-sv-pink/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {displayAvatar ? "Change Photo" : "Upload Photo"}
                </Button>
                {displayAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    data-testid="button-remove-avatar"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="bg-white/5 border-white/10 text-white resize-none"
              rows={4}
              maxLength={500}
              data-testid="input-bio"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {bio.length}/500
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending || isUploading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              className="bg-white text-black hover:bg-white/90"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || isUploading}
              data-testid="button-save-profile"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
