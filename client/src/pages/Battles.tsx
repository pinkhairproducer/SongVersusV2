import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Coins, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SignupModal } from "@/components/auth/SignupModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBattles, createBattle, joinBattle } from "@/lib/api";

import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";
import { Link } from "wouter";

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
  const { user, spendCoins } = useUser();
  const { toast } = useToast();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
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
      setIsSignupOpen(true);
      return;
    }

    try {
      const covers = [cover1, cover2, cover3, cover4];
      const randomCover = covers[Math.floor(Math.random() * covers.length)];
      
      await createBattleMutation.mutateAsync({
        type: user.role === "producer" ? "beat" : "song",
        leftArtist: user.name,
        leftTrack: `New ${user.role === "producer" ? "Beat" : "Song"}`,
        leftCover: randomCover,
        leftUserId: user.id,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      if (!spendCoins(BATTLE_COST)) {
        toast({
          title: "Battle Created but Not Enough Coins",
          description: "Your battle was created but you didn't have enough coins in your account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Battle Started!",
        description: `You spent ${BATTLE_COST} coins to start a new battle. Waiting for opponent...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create battle",
        variant: "destructive",
      });
    }
  };

  const handleJoinBattle = async (battleId: number) => {
    if (!user) {
      setIsSignupOpen(true);
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

      if (!spendCoins(BATTLE_JOIN_COST)) {
        toast({
          title: "Battle Joined but Not Enough Coins",
          description: "You joined the battle but didn't have enough coins in your account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Battle Joined!",
        description: `You spent ${BATTLE_JOIN_COST} coins to join the battle!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join battle",
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
          cover: battle.leftCover || covers[0],
          votes: battle.leftVotes,
          isLeading: battle.leftVotes > battle.rightVotes,
        },
        right: battle.rightArtist ? {
          artist: battle.rightArtist,
          track: battle.rightTrack || "",
          cover: battle.rightCover || covers[1],
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
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold font-heading text-white mb-2">Battle Arena</h1>
              <p className="text-muted-foreground">Vote for your favorites and help them climb the charts.</p>
            </div>
            
            <div className="flex items-center gap-2">
               <Button variant="outline" className="border-white/10 bg-black/20">
                 <Filter className="w-4 h-4 mr-2" /> Filter
               </Button>
            </div>
          </div>

          {/* Create Battle Area */}
          <div className="bg-linear-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 mb-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
             <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Ready to enter the arena?</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Challenge another artist or producer to a battle. Winner takes home the pot and climbs the leaderboard.
                </p>
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 rounded-full shadow-xl shadow-white/10"
                    onClick={handleStartBattle}
                    data-testid="button-start-battle"
                  >
                    Start a New Battle
                  </Button>
                  <span className="text-xs text-yellow-400 font-bold flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                    <Coins className="w-3 h-3" /> Cost: {BATTLE_COST} Coins
                  </span>
                </div>
             </div>
          </div>

          <Tabs defaultValue="open" className="w-full">
            <TabsList className="bg-black/20 border border-white/10 p-1 rounded-lg mb-8 w-full md:w-auto flex-wrap h-auto">
              <TabsTrigger value="open" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white">Open Battles ({openBattles.length})</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white">All Battles ({completeBattles.length})</TabsTrigger>
              <TabsTrigger value="beats" className="flex-1 md:flex-none data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">Beat Battles (Producers)</TabsTrigger>
              <TabsTrigger value="songs" className="flex-1 md:flex-none data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-300">Song Battles (Artists)</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {openBattles.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No open battles right now. Start one to get the party going!</p>
                  </div>
                ) : (
                  openBattles.map((battle) => (
                    <div key={battle.id} className="relative bg-card/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group backdrop-blur-sm">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            Waiting for Opponent
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">{battle.timeLeft} Left</span>
                        </div>
                        
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
                          <img src={battle.left.cover} alt={battle.left.track} className="w-full h-full object-cover" />
                        </div>
                        
                        <h3 className="font-bold text-white truncate">{battle.left.track}</h3>
                        <p className="text-sm text-muted-foreground truncate mb-4">{battle.left.artist}</p>
                        
                        <Button
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                          onClick={() => handleJoinBattle(battle.id)}
                          data-testid={`button-join-battle-${battle.id}`}
                        >
                          Join This Battle
                        </Button>
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
      <SignupModal open={isSignupOpen} onOpenChange={setIsSignupOpen} />
    </div>
  );
}
