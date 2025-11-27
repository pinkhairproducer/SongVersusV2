import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Flame, Crown, Coins, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "@/lib/api";

export default function Leaderboard() {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const LEADERBOARD_DATA = (leaderboardData || []).map((user, index) => ({
    rank: index + 1,
    name: user.name,
    xp: user.xp,
    wins: user.wins,
    coins: user.coins,
    avatar: user.avatar,
    trend: "same",
  }));
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold font-heading text-white mb-2">Global Leaderboard</h1>
              <p className="text-muted-foreground">Top artists and producers ranked by XP.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-card/50 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-r border-white/10 pr-4">
                <Star className="w-4 h-4 text-violet-400" />
                <span>Win Battle = <strong>+500 XP</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>Win Coins = <strong>Store Items</strong></span>
              </div>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
            {/* 2nd Place */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center backdrop-blur-sm order-2 md:order-1 relative">
              <div className="absolute -top-4 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center font-bold text-black border-2 border-background">2</div>
              <Avatar className="w-20 h-20 border-2 border-slate-300 mb-4">
                <AvatarImage src={LEADERBOARD_DATA[1].avatar} />
                <AvatarFallback>2</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-white text-lg mb-1">{LEADERBOARD_DATA[1].name}</h3>
              <div className="text-violet-400 font-bold font-mono">{LEADERBOARD_DATA[1].xp.toLocaleString()} XP</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> {LEADERBOARD_DATA[1].wins} Wins
              </div>
            </div>

            {/* 1st Place */}
            <div className="bg-linear-to-b from-violet-500/20 to-card/50 border border-violet-500/50 rounded-2xl p-8 flex flex-col items-center backdrop-blur-sm order-1 md:order-2 relative transform md:-translate-y-4 shadow-xl shadow-violet-500/10">
              <div className="absolute -top-6 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black border-4 border-background text-xl">
                <Crown className="w-6 h-6" />
              </div>
              <Avatar className="w-24 h-24 border-4 border-yellow-400 mb-4 shadow-lg shadow-yellow-400/20">
                <AvatarImage src={LEADERBOARD_DATA[0].avatar} />
                <AvatarFallback>1</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-white text-xl mb-1">{LEADERBOARD_DATA[0].name}</h3>
              <div className="text-yellow-400 font-bold font-mono text-lg">{LEADERBOARD_DATA[0].xp.toLocaleString()} XP</div>
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" /> {LEADERBOARD_DATA[0].wins} Wins
              </div>
            </div>

            {/* 3rd Place */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center backdrop-blur-sm order-3 relative">
              <div className="absolute -top-4 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center font-bold text-black border-2 border-background">3</div>
              <Avatar className="w-20 h-20 border-2 border-amber-600 mb-4">
                <AvatarImage src={LEADERBOARD_DATA[2].avatar} />
                <AvatarFallback>3</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-white text-lg mb-1">{LEADERBOARD_DATA[2].name}</h3>
              <div className="text-violet-400 font-bold font-mono">{LEADERBOARD_DATA[2].xp.toLocaleString()} XP</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> {LEADERBOARD_DATA[2].wins} Wins
              </div>
            </div>
          </div>

          {/* Full List */}
          <div className="bg-card/30 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5 md:col-span-4">Artist</div>
              <div className="col-span-2 text-right hidden md:block">Wins</div>
              <div className="col-span-3 md:col-span-2 text-right">Coins</div>
              <div className="col-span-3 text-right">XP</div>
            </div>
            
            {LEADERBOARD_DATA.slice(3).map((user) => (
              <div key={user.rank} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                <div className="col-span-1 text-center font-mono font-bold text-muted-foreground">{user.rank}</div>
                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-white truncate">{user.name}</span>
                </div>
                <div className="col-span-2 text-right text-muted-foreground hidden md:block">{user.wins}</div>
                <div className="col-span-3 md:col-span-2 text-right text-yellow-400 font-mono flex items-center justify-end gap-1">
                   {user.coins.toLocaleString()} <Coins className="w-3 h-3" />
                </div>
                <div className="col-span-3 text-right font-bold text-white font-mono">{user.xp.toLocaleString()}</div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
