import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { BattleCard } from "@/components/battle/BattleCard";
import { ArrowRight, Zap, Crown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";

const DEFAULT_COVERS = [cover1, cover2, cover3, cover4];

function getTimeLeft(endsAt: string | null): string {
  if (!endsAt) return "00:00:00";
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function Home() {
  const { data: battles = [], isLoading: battlesLoading } = useQuery({
    queryKey: ["battles-home"],
    queryFn: async () => {
      const res = await fetch("/api/battles");
      if (!res.ok) throw new Error("Failed to fetch battles");
      return res.json();
    },
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard-home"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const activeBattles = battles
    .filter((b: any) => b.status === "active")
    .slice(0, 3)
    .map((battle: any, index: number) => ({
      id: battle.id,
      timeLeft: getTimeLeft(battle.endsAt),
      type: battle.type || "beat",
      left: {
        artist: battle.leftArtist || "Unknown",
        track: battle.leftTrack || "Untitled",
        cover: DEFAULT_COVERS[index % 4],
        votes: battle.leftVotes || 0,
        isLeading: (battle.leftVotes || 0) > (battle.rightVotes || 0),
      },
      right: {
        artist: battle.rightArtist || "Waiting...",
        track: battle.rightTrack || "Challenger",
        cover: DEFAULT_COVERS[(index + 1) % 4],
        votes: battle.rightVotes || 0,
        isLeading: (battle.rightVotes || 0) > (battle.leftVotes || 0),
      },
    }));

  const topUsers = leaderboard
    .filter((user: any) => user.id && user.name)
    .slice(0, 5)
    .map((user: any, index: number) => ({
      id: user.id,
      rank: index + 1,
      name: user.name,
      wins: user.wins || 0,
      score: user.xp || 0,
      avatar: user.profileImageUrl,
    }));
  return (
    <div className="min-h-screen bg-sv-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Trending Battles Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="border-l-4 border-sv-pink pl-6">
              <h2 className="text-3xl font-cyber font-bold text-white mb-2 flex items-center gap-3 uppercase">
                <Zap className="w-6 h-6 text-sv-gold fill-sv-gold" />
                Live Battles
              </h2>
              <p className="text-gray-500 font-body">The hottest matchups happening right now.</p>
            </div>
            <Link href="/battles">
              <button className="font-hud font-bold uppercase tracking-widest text-sv-pink hover:text-white transition-colors flex items-center gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {battlesLoading ? (
              <div className="col-span-3 flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sv-pink" />
              </div>
            ) : activeBattles.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 font-body">No active battles right now. Start one!</p>
              </div>
            ) : (
              activeBattles.map((battle: any) => (
                <Link key={battle.id} href={`/battle/${battle.id}`}>
                  <BattleCard {...battle} />
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Top Producers Section (Leaderboard Teaser) */}
        <section className="py-20 bg-sv-dark border-y border-sv-gray relative overflow-hidden">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="border-l-4 border-sv-gold pl-6 mb-8">
                  <h2 className="text-4xl font-cyber font-bold text-white mb-2 uppercase">
                    Top Legends
                  </h2>
                  <p className="text-gray-500 font-hud uppercase tracking-widest">of the Week</p>
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed font-body">
                  Climb the ranks by winning battles. Top producers earn exclusive badges, 
                  cash prizes, and features on our social channels.
                </p>
                <Link href="/leaderboard">
                  <button className="cyber-btn bg-sv-gold text-black font-cyber font-bold py-3 px-8 uppercase tracking-wider hover:glow-gold">
                    <span>View Leaderboard</span>
                  </button>
                </Link>
              </div>

              <div className="bg-sv-black border border-sv-gray p-6 relative">
                <div className="absolute -top-3 -left-3 bg-sv-purple text-white font-bold font-mono text-xs px-2 py-1 rotate-[-5deg] sketch-border">
                  TOP 5
                </div>
                <div className="space-y-4">
                  {leaderboardLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-sv-gold" />
                    </div>
                  ) : topUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 font-body">No rankings yet. Be the first to battle!</p>
                    </div>
                  ) : (
                    topUsers.map((artist: any) => (
                      <Link key={artist.rank} href={`/user/${artist.id}`}>
                        <div className="flex items-center gap-4 p-3 hover:bg-sv-purple/10 border border-transparent hover:border-sv-purple/30 transition-all group cursor-pointer">
                          <div className={`font-cyber font-bold w-8 text-center ${artist.rank === 1 ? 'text-sv-gold' : artist.rank === 2 ? 'text-gray-300' : artist.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {artist.rank === 1 ? <Crown className="w-6 h-6 fill-sv-gold text-sv-gold mx-auto" /> : `#${artist.rank}`}
                          </div>
                          <Avatar className="w-10 h-10 border border-sv-gray">
                            <AvatarImage src={artist.avatar || undefined} />
                            <AvatarFallback className="bg-sv-dark text-white">{artist.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <h4 className="font-punk text-white group-hover:text-sv-pink transition-colors">{artist.name}</h4>
                            <p className="text-xs text-gray-500 font-hud uppercase tracking-widest">{artist.wins} Wins</p>
                          </div>
                          <div className="font-mono text-sm font-bold text-sv-gold">{artist.score.toLocaleString()}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
