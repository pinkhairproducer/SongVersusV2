import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
}

export function EditProfileDialog({
  open,
  onOpenChange,
  userId,
  currentAvatar,
  currentBio,
}: EditProfileDialogProps) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [bio, setBio] = useState(currentBio);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile picture and bio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Profile Picture URL
            </label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="bg-white/5 border-white/10 text-white"
              data-testid="input-avatar-url"
            />
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
              disabled={mutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              className="bg-white text-black hover:bg-white/90"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
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
