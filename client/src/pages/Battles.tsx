import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Coins, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBattles, createBattle, joinBattle } from "@/lib/api";

import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";
import { Link } from "wouter";
import { AudioOrb } from "@/components/battle/AudioOrb";

interface BattleSide {
  artist: string;
  track: string;
  cover: string;
  votes: number;
  isLeading: boolean;
}

interface FormattedBattle {
  id: number;
  type: string;
  timeLeft: string;
  left: BattleSide;
  right: BattleSide | null;
  canJoin: boolean;
}

interface CompleteBattle extends FormattedBattle {
  right: BattleSide;
}

function isCompleteBattle(battle: FormattedBattle): battle is CompleteBattle {
  return battle.right !== null;
}

export default function Battles() {
  const { user, spendCoins, login } = useUser();
  const { toast } = useToast();
  const BATTLE_COST = 250;
  const BATTLE_JOIN_COST = 250;
  const queryClient = useQueryClient();

  const { data: battlesData, isLoading, refetch } = useQuery({
    queryKey: ["battles"],
    queryFn: fetchBattles,
    refetchInterval: 5000,
  });

  const createBattleMutation = useMutation({
    mutationFn: createBattle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battles"] });
    },
  });

  const joinBattleMutation = useMutation({
    mutationFn: ({ battleId, artist, track, cover }: { battleId: number; artist: string; track: string; cover: string }) =>
      joinBattle(battleId, user!.id, artist, track, cover),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battles"] });
    },
  });

  const handleStartBattle = async () => {
    if (!user) {
      login();
      return;
    }

    if (user.coins < BATTLE_COST) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${BATTLE_COST} coins to start a battle. You only have ${user.coins} coins. Visit the store!`,
        variant: "destructive",
      });
      return;
    }

    try {
      const covers = [cover1, cover2, cover3, cover4];
      const randomCover = covers[Math.floor(Math.random() * covers.length)];
      
      await createBattleMutation.mutateAsync({
        type: user.role === "producer" ? "beat" : "song",
        genre: "general",
        leftArtist: user.name,
        leftTrack: `New ${user.role === "producer" ? "Beat" : "Song"}`,
        leftAudio: randomCover,
        leftUserId: user.id,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      spendCoins(BATTLE_COST);

      toast({
        title: "Battle Started!",
        description: `You spent ${BATTLE_COST} coins to start a new battle. Waiting for opponent...`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create battle",
        variant: "destructive",
      });
    }
  };

  const handleJoinBattle = async (battleId: number) => {
    if (!user) {
      login();
      return;
    }

    if (user.coins < BATTLE_JOIN_COST) {
      toast({
        title: "Not Enough Coins",
        description: `You need ${BATTLE_JOIN_COST} coins to join a battle. You only have ${user.coins} coins. Visit the store!`,
        variant: "destructive",
      });
      return;
    }

    try {
      const covers = [cover1, cover2, cover3, cover4];
      const randomCover = covers[Math.floor(Math.random() * covers.length)];
      
      await joinBattleMutation.mutateAsync({
        battleId,
        artist: user.name,
        track: `New ${user.role === "producer" ? "Beat" : "Song"}`,
        cover: randomCover,
      });

      spendCoins(BATTLE_JOIN_COST);

      toast({
        title: "Battle Joined!",
        description: `You spent ${BATTLE_JOIN_COST} coins to join the battle!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join battle",
        variant: "destructive",
      });
    }
  };

  const formatBattles = (battles: typeof battlesData): FormattedBattle[] => {
    if (!battles) return [];
    
    const covers = [cover1, cover2, cover3, cover4];
    
    return battles.map((battle) => {
      const now = new Date();
      const endsAt = new Date(battle.endsAt);
      const timeLeft = Math.max(0, endsAt.getTime() - now.getTime());
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return {
        id: battle.id,
        type: battle.type,
        timeLeft: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        left: {
          artist: battle.leftArtist,
          track: battle.leftTrack,
          cover: battle.leftAudio || covers[0],
          votes: battle.leftVotes,
          isLeading: battle.leftVotes > battle.rightVotes,
        },
        right: battle.rightArtist ? {
          artist: battle.rightArtist,
          track: battle.rightTrack || "",
          cover: battle.rightAudio || covers[1],
          votes: battle.rightVotes,
          isLeading: battle.rightVotes > battle.leftVotes,
        } : null,
        canJoin: !battle.rightArtist,
      };
    });
  };

  const allFormattedBattles = formatBattles(battlesData) || [];
  const completeBattles = allFormattedBattles.filter(isCompleteBattle);
  const openBattles = allFormattedBattles.filter(b => b.canJoin);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sv-black flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sv-pink" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sv-black flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20 relative">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-10">
            <div className="border-l-4 border-sv-pink pl-6">
              <h1 className="text-4xl font-cyber font-bold text-white mb-2 uppercase">Battle Arena</h1>
              <p className="text-gray-500 font-body">Vote for your favorites and help them climb the charts.</p>
            </div>
            
            <div className="flex items-center gap-2">
               <button className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink transition-colors flex items-center gap-2 border border-sv-gray px-4 py-2">
                 <Filter className="w-4 h-4" /> Filter
               </button>
            </div>
          </div>

          {/* Create Battle Area */}
          <div className="bg-sv-dark border border-sv-gray p-8 mb-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
             <div className="absolute -top-3 -left-3 bg-sv-gold text-black font-bold font-mono text-xs px-2 py-1 rotate-[-5deg] sketch-border z-20">
               ENTER THE ARENA
             </div>
             <div className="relative z-10">
                <h2 className="text-2xl font-cyber font-bold text-white mb-2 uppercase">Ready to Battle?</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto font-body">
                  Challenge another artist or producer to a battle. Winner takes home the pot and climbs the leaderboard.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    className="cyber-btn bg-sv-pink text-black font-cyber font-bold py-4 px-10 uppercase tracking-wider text-lg hover:bg-white hover:glow-pink transition-all"
                    onClick={handleStartBattle}
                    data-testid="button-start-battle"
                  >
                    <span>Start a New Battle</span>
                  </button>
                  <span className="text-xs text-sv-gold font-hud font-bold flex items-center gap-1 bg-sv-black px-3 py-1 border border-sv-gold/30 uppercase tracking-widest">
                    <Coins className="w-3 h-3" /> Cost: {BATTLE_COST} Coins
                  </span>
                </div>
             </div>
          </div>

          <Tabs defaultValue="open" className="w-full">
            <TabsList className="bg-sv-dark border border-sv-gray p-1 mb-8 w-full md:w-auto flex-wrap h-auto">
              <TabsTrigger value="open" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-gold/20 data-[state=active]:text-sv-gold rounded-none">Open ({openBattles.length})</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-pink/20 data-[state=active]:text-sv-pink rounded-none">All ({completeBattles.length})</TabsTrigger>
              <TabsTrigger value="beats" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-purple/20 data-[state=active]:text-sv-purple rounded-none">Beats</TabsTrigger>
              <TabsTrigger value="songs" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-pink/20 data-[state=active]:text-sv-pink rounded-none">Songs</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {openBattles.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-sv-dark border border-sv-gray">
                    <p className="text-gray-500 font-body">No open battles right now. Start one to get the party going!</p>
                  </div>
                ) : (
                  openBattles.map((battle) => (
                    <div key={battle.id} className="relative bg-sv-dark border border-sv-gray overflow-hidden hover:border-sv-gold/50 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 bg-sv-gold text-black font-mono text-xs px-2 py-1 font-bold">
                        OPEN
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-hud font-bold text-sv-gold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-sv-gold animate-pulse" />
                            Waiting for Opponent
                          </span>
                          <span className="text-xs font-mono text-gray-500">{battle.timeLeft}</span>
                        </div>
                        
                        <div className="relative aspect-square flex items-center justify-center mb-4">
                          <AudioOrb 
                            isPlaying={false} 
                            color={battle.type === "beat" ? "purple" : "pink"} 
                            size="lg"
                          />
                        </div>
                        
                        <h3 className="font-punk text-white truncate text-center">{battle.left.track}</h3>
                        <p className="text-sm text-gray-500 truncate mb-4 text-center font-hud">{battle.left.artist}</p>
                        
                        <button
                          className="w-full punk-btn font-punk text-sv-gold border-2 border-sv-gold py-3 hover:bg-sv-gold/10 transition-all sketch-border"
                          onClick={() => handleJoinBattle(battle.id)}
                          data-testid={`button-join-battle-${battle.id}`}
                        >
                          Join Battle ({BATTLE_JOIN_COST} Coins)
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completeBattles.map((battle) => (
                  <Link key={battle.id} href={`/battle/${battle.id}`}>
                    <div className="cursor-pointer">
                      <BattleCard {...battle} />
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="beats" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completeBattles.filter(b => b.type === "beat").map((battle) => (
                  <Link key={battle.id} href={`/battle/${battle.id}`}>
                    <div className="cursor-pointer">
                      <BattleCard {...battle} />
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="songs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completeBattles.filter(b => b.type === "song").map((battle) => (
                  <Link key={battle.id} href={`/battle/${battle.id}`}>
                     <div className="cursor-pointer">
                      <BattleCard {...battle} />
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
      <Footer />
    </div>
  );
}
