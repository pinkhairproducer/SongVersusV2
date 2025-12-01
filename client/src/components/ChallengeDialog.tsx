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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Music, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    id: number;
    name: string;
    role: string;
  };
}

export function ChallengeDialog({ open, onOpenChange, targetUser }: ChallengeDialogProps) {
  const [trackName, setTrackName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [genre, setGenre] = useState("general");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const battleType = targetUser.role === "producer" ? "beat" : "song";

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

  const challengeMutation = useMutation({
    mutationFn: async () => {
      let finalAudioUrl = audioUrl;

      if (audioFile) {
        finalAudioUrl = await uploadAudio(audioFile);
      }

      if (!finalAudioUrl) {
        throw new Error("Please upload an audio file");
      }

      const res = await fetch("/api/battle-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challengedId: targetUser.id,
          battleType,
          genre,
          challengerTrack: trackName,
          challengerAudio: finalAudioUrl,
          message: message || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send challenge");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Sent!",
        description: `Your battle challenge has been sent to ${targetUser.name}. They have 7 days to respond.`,
      });
      queryClient.invalidateQueries({ queryKey: ["sentBattleRequests"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTrackName("");
    setAudioFile(null);
    setAudioUrl("");
    setGenre("general");
    setMessage("");
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
      setAudioUrl("");
    }
  };

  const genres = [
    { value: "general", label: "General" },
    { value: "hiphop", label: "Hip-Hop" },
    { value: "rnb", label: "R&B" },
    { value: "pop", label: "Pop" },
    { value: "electronic", label: "Electronic" },
    { value: "rock", label: "Rock" },
    { value: "latin", label: "Latin" },
    { value: "country", label: "Country" },
    { value: "jazz", label: "Jazz" },
    { value: "classical", label: "Classical" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-sv-pink" />
            Challenge {targetUser.name}
          </DialogTitle>
          <DialogDescription>
            Send a {battleType} battle challenge. Upload your track and wait for them to respond.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trackName" className="text-white">Track Name</Label>
            <Input
              id="trackName"
              placeholder={`Enter your ${battleType} name`}
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              className="bg-zinc-800 border-white/10"
              data-testid="input-track-name"
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
              className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-sv-pink/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-audio-area"
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
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload audio file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, or other audio formats (max 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-white">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-zinc-800 border-white/10" data-testid="select-genre">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                {genres.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message to your challenge..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-800 border-white/10 min-h-[80px]"
              data-testid="input-message"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10"
            data-testid="button-cancel-challenge"
          >
            Cancel
          </Button>
          <Button
            onClick={() => challengeMutation.mutate()}
            disabled={!trackName || (!audioFile && !audioUrl) || challengeMutation.isPending || isUploading}
            className="bg-gradient-to-r from-sv-pink to-sv-purple text-white hover:opacity-90"
            data-testid="button-send-challenge"
          >
            {(challengeMutation.isPending || isUploading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? "Uploading..." : "Sending..."}
              </>
            ) : (
              "Send Challenge"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
