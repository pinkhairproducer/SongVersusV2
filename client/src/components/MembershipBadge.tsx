import { Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipBadgeProps {
  membership: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function MembershipBadge({ membership, size = "sm", showLabel = true }: MembershipBadgeProps) {
  if (membership === "free") return null;

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

  if (membership === "elite") {
    return (
      <div className={cn(
        "flex items-center gap-1 bg-sv-gold/20 border border-sv-gold/50 rounded text-sv-gold font-bold",
        sizeClasses[size]
      )}>
        <Crown className={iconSizes[size]} />
        {showLabel && <span>ELITE</span>}
      </div>
    );
  }

  if (membership === "pro") {
    return (
      <div className={cn(
        "flex items-center gap-1 bg-sv-purple/20 border border-sv-purple/50 rounded text-sv-purple font-bold",
        sizeClasses[size]
      )}>
        <Star className={iconSizes[size]} />
        {showLabel && <span>PRO</span>}
      </div>
    );
  }

  return null;
}
