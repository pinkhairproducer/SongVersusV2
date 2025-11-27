import { Button } from "@/components/ui/button";
import { Play, Pause, Heart, BarChart2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Waveform } from "./Waveform";
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
  const totalVotes = left.votes + right.votes;
  const leftPercent = (left.votes / totalVotes) * 100;
  const rightPercent = (right.votes / totalVotes) * 100;

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
        <span className="text-xs font-mono text-muted-foreground">{timeLeft} Left</span>
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
          <div className="relative z-10 flex flex-col h-full">
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
              <img src={left.cover} alt={left.track} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/side:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-white text-black hover:bg-white/90"
                  onClick={() => setPlaying(playing === "left" ? null : "left")}
                >
                  {playing === "left" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </Button>
              </div>
            </div>
            <div className="mt-auto">
              <h3 className="font-bold text-white truncate">{left.track}</h3>
              <p className="text-sm text-muted-foreground truncate">{left.artist}</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative p-6 group/side">
          <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-500/5 to-transparent opacity-0 group-hover/side:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
              <img src={right.cover} alt={right.track} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/side:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-white text-black hover:bg-white/90"
                  onClick={() => setPlaying(playing === "right" ? null : "right")}
                >
                  {playing === "right" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </Button>
              </div>
            </div>
            <div className="mt-auto text-right">
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
          <Button variant="outline" className="border-white/10 hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/50">
            Vote Left
          </Button>
          <Button variant="outline" className="border-white/10 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 hover:border-fuchsia-500/50">
            Vote Right
          </Button>
        </div>
      </div>

      {/* Audio Visualizer Area (active when playing) */}
      <div className="h-12 bg-black/40 border-t border-white/5 flex items-center justify-center px-4">
        {playing ? (
          <Waveform color={playing === "left" ? "bg-violet-500" : "bg-fuchsia-500"} />
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <BarChart2 className="w-3 h-3" />
            Preview tracks to vote
          </span>
        )}
      </div>
    </motion.div>
  );
}
