import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoundersBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FoundersBadge({ size = "sm", showLabel = true }: FoundersBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-gradient-to-r from-sv-gold/30 to-sv-pink/30 border border-sv-gold rounded text-sv-gold font-bold animate-pulse",
        sizeClasses[size]
      )}
      title="One of the first 10 members to support SongVersus!"
      data-testid="badge-founder"
    >
      <Shield className={cn(iconSizes[size], "fill-sv-gold/50")} />
      {showLabel && <span>FOUNDER</span>}
    </div>
  );
}
