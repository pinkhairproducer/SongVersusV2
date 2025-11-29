import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  trackName: string;
  artistName: string;
  color?: "cyan" | "fuchsia" | "pink" | "purple";
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  disabled?: boolean;
}

export function AudioPlayer({
  audioUrl,
  trackName,
  artistName,
  color = "cyan",
  isPlaying,
  onPlayStateChange,
  disabled = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorClasses = {
    cyan: {
      bg: "bg-cyan-500",
      hover: "hover:bg-cyan-600",
      text: "text-cyan-400",
      slider: "bg-cyan-500",
      glow: "shadow-cyan-500/50",
    },
    fuchsia: {
      bg: "bg-fuchsia-500",
      hover: "hover:bg-fuchsia-600",
      text: "text-fuchsia-400",
      slider: "bg-fuchsia-500",
      glow: "shadow-fuchsia-500/50",
    },
    pink: {
      bg: "bg-sv-pink",
      hover: "hover:bg-sv-pink/80",
      text: "text-sv-pink",
      slider: "bg-sv-pink",
      glow: "shadow-sv-pink/50",
    },
    purple: {
      bg: "bg-sv-purple",
      hover: "hover:bg-sv-purple/80",
      text: "text-sv-purple",
      slider: "bg-sv-purple",
      glow: "shadow-sv-purple/50",
    },
  };

  const colors = colorClasses[color];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError("Unable to load audio");
      setIsLoading(false);
    };
    const handleEnded = () => onPlayStateChange(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onPlayStateChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        onPlayStateChange(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (disabled || isLoading || error) return;
    onPlayStateChange(!isPlaying);
  }, [disabled, isLoading, error, isPlaying, onPlayStateChange]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
    if (value[0] > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all",
      isPlaying && `shadow-lg ${colors.glow}`
    )}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className={cn(
            "w-14 h-14 rounded-full transition-all",
            isPlaying ? `${colors.bg} ${colors.hover} text-white` : "bg-white/10 hover:bg-white/20 text-white",
            (disabled || isLoading || error) && "opacity-50 cursor-not-allowed"
          )}
          onClick={togglePlay}
          disabled={disabled || isLoading || !!error}
          data-testid={`button-play-${color}`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="truncate">
              <h4 className="font-bold text-white truncate">{trackName}</h4>
              <p className={cn("text-sm truncate", colors.text)}>{artistName}</p>
            </div>
            <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="relative group">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={disabled || isLoading || !!error}
              className={cn(
                "cursor-pointer",
                "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3",
                "[&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100",
                `[&_[role=slider]]:${colors.bg}`,
                "[&_[data-orientation=horizontal]>.range]:bg-gradient-to-r",
                color === "cyan" && "[&_[data-orientation=horizontal]>.range]:from-cyan-600 [&_[data-orientation=horizontal]>.range]:to-cyan-400",
                color === "fuchsia" && "[&_[data-orientation=horizontal]>.range]:from-fuchsia-600 [&_[data-orientation=horizontal]>.range]:to-fuchsia-400",
                color === "pink" && "[&_[data-orientation=horizontal]>.range]:from-pink-600 [&_[data-orientation=horizontal]>.range]:to-pink-400",
                color === "purple" && "[&_[data-orientation=horizontal]>.range]:from-purple-600 [&_[data-orientation=horizontal]>.range]:to-purple-400"
              )}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-white"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <div className="w-20 hidden sm:block">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
