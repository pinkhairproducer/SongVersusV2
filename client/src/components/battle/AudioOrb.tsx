import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useShouldReduceMotion } from "@/hooks/useIsMobile";

interface AudioOrbProps {
  isPlaying?: boolean;
  color?: "violet" | "fuchsia" | "blue" | "green" | "pink" | "purple" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AudioOrb({ 
  isPlaying = false, 
  color = "violet", 
  size = "md",
  className 
}: AudioOrbProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>([0.3, 0.5, 0.4, 0.6, 0.3]);
  const reduceMotion = useShouldReduceMotion();

  useEffect(() => {
    if (!isPlaying || reduceMotion) {
      setAudioLevels([0.3, 0.5, 0.4, 0.6, 0.3]);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => 0.3 + Math.random() * 0.7)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, reduceMotion]);

  const colorClasses = {
    violet: {
      primary: "from-violet-600 to-violet-400",
      glow: "shadow-violet-500/50",
      ring: "border-violet-500/30",
      pulse: "bg-violet-500",
    },
    fuchsia: {
      primary: "from-fuchsia-600 to-fuchsia-400",
      glow: "shadow-fuchsia-500/50",
      ring: "border-fuchsia-500/30",
      pulse: "bg-fuchsia-500",
    },
    blue: {
      primary: "from-blue-600 to-blue-400",
      glow: "shadow-blue-500/50",
      ring: "border-blue-500/30",
      pulse: "bg-blue-500",
    },
    green: {
      primary: "from-green-600 to-green-400",
      glow: "shadow-green-500/50",
      ring: "border-green-500/30",
      pulse: "bg-green-500",
    },
    pink: {
      primary: "from-[#FF2EC3] to-[#ff6ed8]",
      glow: "shadow-[#FF2EC3]/50",
      ring: "border-[#FF2EC3]/30",
      pulse: "bg-[#FF2EC3]",
    },
    purple: {
      primary: "from-[#A64BFF] to-[#c78fff]",
      glow: "shadow-[#A64BFF]/50",
      ring: "border-[#A64BFF]/30",
      pulse: "bg-[#A64BFF]",
    },
    gold: {
      primary: "from-[#F6C844] to-[#ffd970]",
      glow: "shadow-[#F6C844]/50",
      ring: "border-[#F6C844]/30",
      pulse: "bg-[#F6C844]",
    },
  };

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const colors = colorClasses[color];
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("relative flex items-center justify-center", sizeClass, className)}>
      {/* Outer glow rings - static on mobile */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 opacity-30",
          colors.ring
        )}
      />
      
      <div
        className={cn(
          "absolute inset-2 rounded-full border opacity-40",
          colors.ring
        )}
      />

      {/* Main orb - static on mobile */}
      <div
        className={cn(
          "absolute inset-4 rounded-full bg-gradient-to-br",
          colors.primary,
          isPlaying && `shadow-2xl ${colors.glow}`
        )}
      />

      {/* Inner glow */}
      <div
        className={cn(
          "absolute inset-6 rounded-full bg-white/20 backdrop-blur-sm",
          isPlaying ? "opacity-30" : "opacity-20"
        )}
      />

      {/* Audio visualizer bars - simplified on mobile */}
      {isPlaying && !reduceMotion && (
        <div className="absolute inset-0 flex items-center justify-center gap-0.5">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className={cn("w-1 rounded-full", colors.pulse)}
              style={{
                height: `${level * 40}%`,
                opacity: level,
              }}
            />
          ))}
        </div>
      )}

      {/* Center dot */}
      <div
        className={cn(
          "absolute w-2 h-2 rounded-full bg-white",
          isPlaying ? "opacity-100" : "opacity-60"
        )}
      />
    </div>
  );
}
