import { Button } from "@/components/ui/button";
import { Play, Pause, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AudioOrb } from "./AudioOrb";
import { cn } from "@/lib/utils";
import { useShouldReduceMotion } from "@/hooks/useIsMobile";

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
  type?: string;
  genre?: string;
}

export function BattleCard({ left, right, timeLeft, type = "beat", genre = "general" }: BattleCardProps) {
  const [playing, setPlaying] = useState<"left" | "right" | null>(null);
  const [displayTime, setDisplayTime] = useState(timeLeft);
  const reduceMotion = useShouldReduceMotion();
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

  const isBeat = type === "beat";

  return (
    <div 
      className={cn(
        "bg-sv-dark border border-sv-gray overflow-hidden hover:border-sv-pink/50 transition-all duration-300 group relative",
        !reduceMotion && "hover:-translate-y-1"
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-sv-gray bg-sv-black/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${isBeat ? 'bg-sv-purple' : 'bg-sv-pink'} animate-pulse`} />
            <span className={`text-xs font-hud font-bold uppercase tracking-widest ${isBeat ? 'text-sv-purple' : 'text-sv-pink'}`}>
              {isBeat ? 'Beat Battle' : 'Song Battle'}
            </span>
          </div>
          <span className="text-xs font-mono text-sv-gold bg-sv-gold/10 px-2 py-0.5 uppercase">
            {genre}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-500">{displayTime}</span>
      </div>

      {/* Battle Area */}
      <div className="grid grid-cols-2 relative min-h-[200px]">
        
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 bg-sv-black border-2 border-sv-gold flex items-center justify-center skew-x-[-12deg] glow-gold">
            <span className="font-punk text-sv-gold text-lg skew-x-[12deg]">VS</span>
          </div>
        </div>

        {/* Left Side */}
        <div className="relative p-6 border-r border-sv-gray group/side">
          <div className="absolute inset-0 bg-gradient-to-br from-sv-pink/5 to-transparent opacity-0 group-hover/side:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full items-center">
            <div className="relative aspect-square w-full flex items-center justify-center mb-4">
              <AudioOrb 
                isPlaying={playing === "left"} 
                color="pink" 
                size="lg"
              />
              <Button 
                size="icon" 
                className="absolute bottom-0 right-0 w-10 h-10 bg-sv-pink text-black hover:bg-white hover:glow-pink"
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
              <h3 className="font-punk text-white truncate">{left.track}</h3>
              <p className="text-sm text-gray-500 truncate font-hud">{left.artist}</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative p-6 group/side">
          <div className="absolute inset-0 bg-gradient-to-bl from-sv-purple/5 to-transparent opacity-0 group-hover/side:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full items-center">
            <div className="relative aspect-square w-full flex items-center justify-center mb-4">
              <AudioOrb 
                isPlaying={playing === "right"} 
                color="purple" 
                size="lg"
              />
              <Button 
                size="icon" 
                className="absolute bottom-0 left-0 w-10 h-10 bg-sv-purple text-white hover:bg-white hover:text-sv-purple hover:glow-purple"
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
              <h3 className="font-punk text-white truncate">{right.track}</h3>
              <p className="text-sm text-gray-500 truncate font-hud">{right.artist}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Bar */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center justify-between text-xs font-hud font-bold mb-2 uppercase tracking-widest">
          <span className={cn("transition-colors", left.isLeading ? "text-sv-pink" : "text-gray-500")}>
            {left.votes} Votes
          </span>
          <span className={cn("transition-colors", !left.isLeading ? "text-sv-purple" : "text-gray-500")}>
            {right.votes} Votes
          </span>
        </div>
        <div className="h-2 w-full bg-sv-gray overflow-hidden flex">
          <div 
            className="h-full bg-sv-pink transition-all duration-300"
            style={{ width: `${leftPercent}%` }}
          />
          <div 
            className="h-full bg-sv-purple transition-all duration-300"
            style={{ width: `${rightPercent}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button 
            className="punk-btn font-punk text-sv-pink border-2 border-sv-pink py-2 px-4 rotate-1 hover:-rotate-1 hover:bg-sv-pink/10 transition-all sketch-border"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid="button-vote-left"
          >
            Vote Left
          </button>
          <button 
            className="punk-btn font-punk text-sv-purple border-2 border-sv-purple py-2 px-4 -rotate-1 hover:rotate-1 hover:bg-sv-purple/10 transition-all sketch-border"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid="button-vote-right"
          >
            Vote Right
          </button>
        </div>
      </div>

      {/* Audio Status */}
      <div className="h-12 bg-sv-black border-t border-sv-gray flex items-center justify-center px-4">
        {playing ? (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 animate-pulse", playing === "left" ? "bg-sv-pink" : "bg-sv-purple")} />
            <span className={cn("text-xs font-hud font-bold uppercase tracking-widest", playing === "left" ? "text-sv-pink" : "text-sv-purple")}>
              Now Playing: {playing === "left" ? left.track : right.track}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 flex items-center gap-2 font-hud uppercase tracking-widest">
            <BarChart2 className="w-3 h-3" />
            Click play to preview
          </span>
        )}
      </div>
    </div>
  );
}
