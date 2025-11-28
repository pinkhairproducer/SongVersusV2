import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AudioOrbProps {
  isPlaying?: boolean;
  color?: "violet" | "fuchsia" | "blue" | "green" | "pink" | "purple";
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

  useEffect(() => {
    if (!isPlaying) {
      setAudioLevels([0.3, 0.5, 0.4, 0.6, 0.3]);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => 
        prev.map(() => 0.3 + Math.random() * 0.7)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
      {/* Outer glow rings */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-2 opacity-30",
          colors.ring
        )}
        animate={isPlaying ? {
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className={cn(
          "absolute inset-2 rounded-full border opacity-40",
          colors.ring
        )}
        animate={isPlaying ? {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.2, 0.4],
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Main orb */}
      <motion.div
        className={cn(
          "absolute inset-4 rounded-full bg-gradient-to-br",
          colors.primary,
          isPlaying && `shadow-2xl ${colors.glow}`
        )}
        animate={isPlaying ? {
          scale: [1, 1.08, 1],
        } : {
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: isPlaying ? 0.3 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner glow */}
      <motion.div
        className={cn(
          "absolute inset-6 rounded-full bg-white/20 backdrop-blur-sm"
        )}
        animate={isPlaying ? {
          opacity: [0.2, 0.4, 0.2],
        } : {
          opacity: 0.2,
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Audio visualizer bars (only when playing) */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center gap-0.5">
          {audioLevels.map((level, i) => (
            <motion.div
              key={i}
              className={cn("w-1 rounded-full", colors.pulse)}
              animate={{
                height: `${level * 40}%`,
                opacity: level,
              }}
              transition={{
                duration: 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Center dot */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-white"
        animate={isPlaying ? {
          scale: [1, 1.5, 1],
          opacity: [0.8, 1, 0.8],
        } : {
          opacity: 0.6,
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
