import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Music, Upload, X, Play, Pause } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface BattleRequest {
  id: number;
  challengerId: number;
  challengedId: number;
  status: string;
  battleType: string;
  genre: string;
  challengerTrack: string;
  challengerAudio: string;
  challengedTrack: string | null;
  challengedAudio: string | null;
  message: string | null;
  expiresAt: string;
  createdAt: string;
  challengerName: string | null;
  challengerAvatar: string | null;
}

interface AcceptBattleRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleRequest: BattleRequest | null;
}

export function AcceptBattleRequestDialog({ open, onOpenChange, battleRequest }: AcceptBattleRequestDialogProps) {
  const [trackName, setTrackName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadAudio = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", ".private/battle-audio");

      const res = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload audio");
      const data = await res.json();
      return data.url || data.publicUrl || data.objectPath;
    } finally {
      setIsUploading(false);
    }
  };

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!battleRequest || !audioFile) throw new Error("Missing data");

      const audioUrl = await uploadAudio(audioFile);

      const res = await fetch(`/api/battle-requests/${battleRequest.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challengedTrack: trackName,
          challengedAudio: audioUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to accept battle request");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Battle Accepted!",
        description: "The battle is now live. Let the voting begin!",
      });
      queryClient.invalidateQueries({ queryKey: ["pendingBattleRequests"] });
      queryClient.invalidateQueries({ queryKey: ["battles"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept battle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTrackName("");
    setAudioFile(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setAudioFile(file);
    }
  };

  const togglePlayChallenger = () => {
    if (!battleRequest?.challengerAudio || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!battleRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-sv-pink" />
            Accept Battle Challenge
          </DialogTitle>
          <DialogDescription>
            {battleRequest.challengerName} challenged you to a {battleRequest.battleType} battle. Upload your track to accept.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-zinc-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Challenger's Track</p>
                <p className="text-white font-medium">{battleRequest.challengerTrack}</p>
                <p className="text-xs text-sv-purple capitalize">{battleRequest.genre}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayChallenger}
                className="border-white/10 hover:border-sv-pink/50"
                data-testid="button-play-challenger"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            <audio
              ref={audioRef}
              src={battleRequest.challengerAudio}
              onEnded={() => setIsPlaying(false)}
            />
            {battleRequest.message && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted-foreground">Message</p>
                <p className="text-sm text-white italic">"{battleRequest.message}"</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-medium text-white mb-3">Your Response</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackName" className="text-white">Track Name</Label>
                <Input
                  id="trackName"
                  placeholder={`Enter your ${battleRequest.battleType} name`}
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  className="bg-zinc-800 border-white/10"
                  data-testid="input-response-track-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Audio File</Label>
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-sv-pink/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-response-audio-area"
                >
                  {audioFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <Music className="w-5 h-5 text-sv-pink" />
                      <span className="text-white truncate max-w-[200px]">{audioFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioFile(null);
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload your track
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10"
            data-testid="button-cancel-accept"
          >
            Cancel
          </Button>
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={!trackName || !audioFile || acceptMutation.isPending || isUploading}
            className="bg-gradient-to-r from-sv-pink to-sv-purple text-white hover:opacity-90"
            data-testid="button-confirm-accept"
          >
            {(acceptMutation.isPending || isUploading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? "Uploading..." : "Accepting..."}
              </>
            ) : (
              "Accept Battle"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
