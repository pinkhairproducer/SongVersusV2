import { Trophy, Zap, Coins, Crown, Star, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

interface ProfileCardProps {
  userId: number;
  name: string;
  avatar?: string | null;
  role?: string;
  level?: number;
  xp?: number;
  wins?: number;
  coins?: number;
  membership?: string;
  foundersBadge?: boolean;
  side: "left" | "right";
  isWinner?: boolean;
}

export function ProfileCard({
  userId,
  name,
  avatar,
  role = "artist",
  level = 1,
  xp = 0,
  wins = 0,
  coins,
  membership = "free",
  foundersBadge = false,
  side,
  isWinner = false,
}: ProfileCardProps) {
  const getFoundersBadge = () => {
    if (!foundersBadge) return null;
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-sv-gold/30 to-sv-pink/30 border border-sv-gold rounded text-sv-gold text-xs font-bold animate-pulse" title="Founder">
        <Shield className="w-3 h-3 fill-sv-gold/50" />
        FOUNDER
      </div>
    );
  };

  const getMembershipBadge = () => {
    if (membership === "elite") {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-sv-gold/20 border border-sv-gold/50 rounded text-sv-gold text-xs font-bold">
          <Crown className="w-3 h-3" />
          ELITE
        </div>
      );
    }
    if (membership === "pro") {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-sv-purple/20 border border-sv-purple/50 rounded text-sv-purple text-xs font-bold">
          <Star className="w-3 h-3" />
          PRO
        </div>
      );
    }
    return null;
  };

  const getRarityColor = () => {
    if (level >= 40) return "from-sv-gold via-yellow-300 to-sv-gold";
    if (level >= 25) return "from-sv-purple via-purple-400 to-sv-purple";
    if (level >= 10) return "from-blue-500 via-blue-400 to-blue-500";
    return "from-gray-500 via-gray-400 to-gray-500";
  };

  return (
    <div
      className={`relative ${side === "right" ? "text-right" : "text-left"}`}
      data-testid={`profile-card-${side}`}
    >
      <Link href={`/user/${userId}`}>
        <div className={`group cursor-pointer flex items-center gap-3 ${side === "right" ? "flex-row-reverse" : ""}`}>
          <div className="relative">
            <div className={`absolute -inset-1 bg-gradient-to-r ${getRarityColor()} rounded-full opacity-50 blur-sm group-hover:opacity-100 transition-opacity`} />
            <Avatar className="w-14 h-14 border-2 border-sv-gray relative">
              <AvatarImage src={avatar || undefined} alt={name} />
              <AvatarFallback className="bg-sv-dark text-sv-pink font-bold text-lg">
                {(name || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isWinner && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-sv-gold rounded-full flex items-center justify-center">
                <Trophy className="w-3 h-3 text-black" />
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-sv-black border border-sv-gray rounded text-xs font-mono text-gray-400">
              LVL {level}
            </div>
          </div>

          <div className={`flex flex-col ${side === "right" ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-cyber text-white font-bold group-hover:text-sv-pink transition-colors">
                {name || "Unknown"}
              </span>
              {getFoundersBadge()}
              {getMembershipBadge()}
            </div>
            
            <div className={`flex items-center gap-3 text-xs text-gray-500 mt-1 ${side === "right" ? "flex-row-reverse" : ""}`}>
              <span className="flex items-center gap-1 capitalize">
                {role === "producer" ? (
                  <Zap className="w-3 h-3 text-sv-purple" />
                ) : (
                  <Zap className="w-3 h-3 text-sv-pink" />
                )}
                {role}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-sv-gold" />
                {wins} wins
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-sv-purple" />
                {xp} XP
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
