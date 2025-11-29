import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBattle } from "@/lib/api";
import { Loader2, Upload, Music, ChevronLeft, ChevronRight, Coins, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRES = [
  { id: "hip-hop", label: "Hip-Hop", icon: "🎤" },
  { id: "trap", label: "Trap", icon: "🔥" },
  { id: "r&b", label: "R&B", icon: "💜" },
  { id: "pop", label: "Pop", icon: "🎵" },
  { id: "electronic", label: "Electronic", icon: "⚡" },
  { id: "lo-fi", label: "Lo-Fi", icon: "🌙" },
  { id: "rock", label: "Rock", icon: "🎸" },
  { id: "jazz", label: "Jazz", icon: "🎷" },
  { id: "classical", label: "Classical", icon: "🎻" },
  { id: "other", label: "Other", icon: "🎶" },
];

interface StartBattleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleCost: number;
}

export function StartBattleDialog({ open, onOpenChange, battleCost }: StartBattleDialogProps) {
  const { user, spendCoins } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<"genre" | "upload" | "confirm">("genre");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [trackName, setTrackName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBattleMutation = useMutation({
    mutationFn: createBattle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battles"] });
    },
  });

  const resetDialog = () => {
    setStep("genre");
    setSelectedGenre(null);
    setTrackName("");
    setAudioFile(null);
    setAudioUrl(null);
    setUploadStatus("idle");
  };

  const handleClose = () => {
    if (!isUploading && !createBattleMutation.isPending) {
      resetDialog();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Audio files must be under 50MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    setUploadStatus("idle");
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      
      const { uploadURL } = await response.json();
      
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: audioFile,
        headers: {
          "Content-Type": audioFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const objectUrl = uploadURL.split("?")[0];
      
      const aclResponse = await fetch("/api/objects/set-acl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          objectUrl,
          visibility: "public"
        }),
      });

      if (!aclResponse.ok) {
        console.warn("Failed to set ACL, using original URL");
      }

      const aclData = await aclResponse.json().catch(() => ({ objectPath: objectUrl }));
      setAudioUrl(aclData.objectPath || objectUrl);
      setUploadStatus("success");
      setStep("confirm");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartBattle = async () => {
    if (!user || !selectedGenre || !audioUrl) return;

    if (user.coins < battleCost) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${battleCost} coins to start a battle.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createBattleMutation.mutateAsync({
        type: user.role === "producer" ? "beat" : "song",
        genre: selectedGenre,
        leftArtist: user.name || "Anonymous",
        leftTrack: trackName || `New ${user.role === "producer" ? "Beat" : "Song"}`,
        leftAudio: audioUrl,
        leftUserId: user.id,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      spendCoins(battleCost);

      toast({
        title: "Battle Started!",
        description: `You spent ${battleCost} coins to start a new battle. Waiting for opponent...`,
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create battle",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-sv-dark border-sv-gray">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Music className="w-6 h-6 text-sv-pink" />
            Start a Battle
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "genre" && "Choose your genre to find the right opponents"}
            {step === "upload" && "Upload your track to enter the arena"}
            {step === "confirm" && "Review and launch your battle"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 my-4">
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors",
            step === "genre" ? "bg-sv-pink" : "bg-sv-gray"
          )} />
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors",
            step === "upload" ? "bg-sv-pink" : "bg-sv-gray"
          )} />
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors",
            step === "confirm" ? "bg-sv-pink" : "bg-sv-gray"
          )} />
        </div>

        {step === "genre" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    selectedGenre === genre.id
                      ? "border-sv-pink bg-sv-pink/10 text-white"
                      : "border-sv-gray bg-sv-gray/20 text-gray-300 hover:border-sv-pink/50"
                  )}
                  data-testid={`genre-${genre.id}`}
                >
                  <span className="text-xl mr-2">{genre.icon}</span>
                  <span className="font-medium">{genre.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep("upload")}
                disabled={!selectedGenre}
                className="bg-sv-pink hover:bg-sv-pink/80 text-black font-bold"
                data-testid="button-next-to-upload"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="trackName" className="text-white">Track Name</Label>
              <Input
                id="trackName"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder={`My ${user.role === "producer" ? "Beat" : "Song"}`}
                className="bg-sv-gray/30 border-sv-gray text-white mt-1"
                data-testid="input-track-name"
              />
            </div>

            <div>
              <Label className="text-white">Audio File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!audioFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 border-2 border-dashed border-sv-gray rounded-lg p-6 text-center cursor-pointer hover:border-sv-pink transition-colors"
                  data-testid="upload-dropzone"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-400">Click to upload your audio file</p>
                  <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC (max 50MB)</p>
                </div>
              ) : (
                <div className="mt-1 border border-sv-gray rounded-lg p-4 bg-sv-gray/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Music className="w-8 h-8 text-sv-pink" />
                      <div>
                        <p className="text-white font-medium truncate max-w-[200px]">{audioFile.name}</p>
                        <p className="text-xs text-gray-400">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAudioFile(null);
                        setUploadStatus("idle");
                      }}
                      disabled={isUploading}
                      className="text-gray-400"
                    >
                      Change
                    </Button>
                  </div>

                  {uploadStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-500 mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Upload successful!</span>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-500 mt-2">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Upload failed. Please try again.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep("genre")}
                className="text-gray-400"
                data-testid="button-back-to-genre"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!audioFile || isUploading}
                className="bg-sv-pink hover:bg-sv-pink/80 text-black font-bold"
                data-testid="button-upload-audio"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload & Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-sv-gray/20 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Genre</span>
                <span className="text-white font-medium capitalize">
                  {GENRES.find(g => g.id === selectedGenre)?.label || selectedGenre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Track</span>
                <span className="text-white font-medium">
                  {trackName || `New ${user.role === "producer" ? "Beat" : "Song"}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white font-medium capitalize">
                  {user.role === "producer" ? "Beat Battle" : "Song Battle"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-sv-gray">
                <span className="text-gray-400">Entry Fee</span>
                <span className="text-sv-gold font-bold flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {battleCost} Coins
                </span>
              </div>
            </div>

            <div className="bg-sv-pink/10 border border-sv-pink/30 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                Your balance: <span className="text-sv-gold font-bold">{user.coins} coins</span>
                {user.coins < battleCost && (
                  <span className="text-red-400 ml-2">(Not enough coins!)</span>
                )}
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep("upload")}
                className="text-gray-400"
                data-testid="button-back-to-upload"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleStartBattle}
                disabled={createBattleMutation.isPending || user.coins < battleCost}
                className="bg-sv-pink hover:bg-sv-pink/80 text-black font-bold"
                data-testid="button-confirm-battle"
              >
                {createBattleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Start Battle ({battleCost} Coins)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
