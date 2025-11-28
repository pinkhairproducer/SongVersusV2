import { Button } from "@/components/ui/button";
import { Play, Pause, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AudioOrb } from "./AudioOrb";
import { cn } from "@/lib/utils";

interface BattleSide {
  artist: string;
  track: string;
  cover: string;
  votes: number;
  isLeading?: boolean;
}

interface BattleCardProps {
  left: BattleSide;
  right: BattleSide;
  timeLeft: string;
}

export function BattleCard({ left, right, timeLeft }: BattleCardProps) {
  const [playing, setPlaying] = useState<"left" | "right" | null>(null);
  const [displayTime, setDisplayTime] = useState(timeLeft);
  const totalVotes = left.votes + right.votes || 1;
  const leftPercent = (left.votes / totalVotes) * 100;
  const rightPercent = (right.votes / totalVotes) * 100;

  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime(prev => {
        const parts = prev.split(':').map(Number);
        if (parts.length !== 3) return prev;
        
        let [hours, minutes, seconds] = parts;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-card/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group backdrop-blur-sm"
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Battle</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{displayTime} Left</span>
      </div>

      {/* Battle Area */}
      <div className="grid grid-cols-2 relative min-h-[200px]">
        
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-xl shadow-violet-500/20">
            <span className="font-black font-heading italic text-white text-sm">VS</span>
          </div>
        </div>

        {/* Left Side */}
        <div className="relative p-6 border-r border-white/5 group/side">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover/side:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full items-center">
            <div className="relative aspect-square w-full flex items-center justify-center mb-4">
              <AudioOrb 
                isPlaying={playing === "left"} 
                color="violet" 
                size="lg"
              />
              <Button 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-white text-black hover:bg-white/90 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlaying(playing === "left" ? null : "left");
                }}
                data-testid="button-play-left"
              >
                {playing === "left" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
            </div>
            <div className="mt-auto text-center w-full">
              <h3 className="font-bold text-white truncate">{left.track}</h3>
              <p className="text-sm text-muted-foreground truncate">{left.artist}</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative p-6 group/side">
          <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500/5 to-transparent opacity-0 group-hover/side:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full items-center">
            <div className="relative aspect-square w-full flex items-center justify-center mb-4">
              <AudioOrb 
                isPlaying={playing === "right"} 
                color="fuchsia" 
                size="lg"
              />
              <Button 
                size="icon" 
                className="absolute bottom-0 left-0 rounded-full w-10 h-10 bg-white text-black hover:bg-white/90 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlaying(playing === "right" ? null : "right");
                }}
                data-testid="button-play-right"
              >
                {playing === "right" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
            </div>
            <div className="mt-auto text-center w-full">
              <h3 className="font-bold text-white truncate">{right.track}</h3>
              <p className="text-sm text-muted-foreground truncate">{right.artist}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Bar */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <span className={cn("transition-colors", left.isLeading ? "text-violet-400" : "text-muted-foreground")}>
            {left.votes} Votes
          </span>
          <span className={cn("transition-colors", !left.isLeading ? "text-fuchsia-400" : "text-muted-foreground")}>
            {right.votes} Votes
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: `${leftPercent}%` }}
            className="h-full bg-violet-500"
          />
          <motion.div 
            initial={{ width: "50%" }}
            animate={{ width: `${rightPercent}%` }}
            className="h-full bg-fuchsia-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid="button-vote-left"
          >
            Vote Left
          </Button>
          <Button 
            variant="outline" 
            className="border-white/10 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 hover:border-fuchsia-500/50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid="button-vote-right"
          >
            Vote Right
          </Button>
        </div>
      </div>

      {/* Audio Status */}
      <div className="h-12 bg-black/40 border-t border-white/5 flex items-center justify-center px-4">
        {playing ? (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", playing === "left" ? "bg-violet-500" : "bg-fuchsia-500")} />
            <span className={cn("text-xs font-medium", playing === "left" ? "text-violet-400" : "text-fuchsia-400")}>
              Now Playing: {playing === "left" ? left.track : right.track}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-3 h-3" />
            Click play to preview tracks
          </span>
        )}
      </div>
    </motion.div>
  );
}
