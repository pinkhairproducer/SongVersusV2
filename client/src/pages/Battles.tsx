import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Coins, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBattles } from "@/lib/api";
import { StartBattleDialog } from "@/components/battle/StartBattleDialog";
import { JoinBattleDialog } from "@/components/battle/JoinBattleDialog";

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
  genre: string;
  timeLeft: string;
  status: string;
  winner: string | null;
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
  const [showStartBattleDialog, setShowStartBattleDialog] = useState(false);
  const [showJoinBattleDialog, setShowJoinBattleDialog] = useState(false);
  const [selectedBattleToJoin, setSelectedBattleToJoin] = useState<{
    id: number;
    type: string;
    genre: string;
    opponentName: string;
    opponentTrack: string;
  } | null>(null);

  const { data: battlesData, isLoading, refetch } = useQuery({
    queryKey: ["battles"],
    queryFn: fetchBattles,
    refetchInterval: 5000,
  });

  const handleStartBattle = () => {
    if (!user) {
      login();
      return;
    }
    setShowStartBattleDialog(true);
  };

  const handleJoinBattle = (battleId: number, battleType: string, battleGenre: string, opponentName: string, opponentTrack: string) => {
    if (!user) {
      login();
      return;
    }

    const userBattleType = user.role === "producer" ? "beat" : "song";
    if (battleType !== userBattleType) {
      toast({
        title: "Wrong Battle Type",
        description: user.role === "producer" 
          ? "As a Producer, you can only join Beat Battles" 
          : "As an Artist, you can only join Song Battles",
        variant: "destructive",
      });
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

    setSelectedBattleToJoin({
      id: battleId,
      type: battleType,
      genre: battleGenre,
      opponentName,
      opponentTrack,
    });
    setShowJoinBattleDialog(true);
  };

  const formatBattles = (battles: typeof battlesData): FormattedBattle[] => {
    if (!battles) return [];
    
    const covers = [cover1, cover2, cover3, cover4];
    
    return battles.map((battle) => {
      const now = new Date();
      const endsAt = battle.endsAt ? new Date(battle.endsAt) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const timeLeft = Math.max(0, endsAt.getTime() - now.getTime());
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return {
        id: battle.id,
        type: battle.type,
        genre: battle.genre || "general",
        timeLeft: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        status: battle.status,
        winner: battle.winner || null,
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
        canJoin: !battle.rightArtist && battle.status !== "completed",
      };
    });
  };

  const allFormattedBattles = formatBattles(battlesData) || [];
  const completeBattles = allFormattedBattles.filter(isCompleteBattle);
  const openBattles = allFormattedBattles.filter(b => b.canJoin);
  const beatBattles = completeBattles.filter(b => b.type === "beat");
  const songBattles = completeBattles.filter(b => b.type === "song");

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
              <TabsTrigger value="all" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-none">All ({completeBattles.length})</TabsTrigger>
              <TabsTrigger value="beats" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-purple/20 data-[state=active]:text-sv-purple rounded-none">Beats ({beatBattles.length})</TabsTrigger>
              <TabsTrigger value="songs" className="flex-1 md:flex-none font-hud uppercase tracking-widest data-[state=active]:bg-sv-pink/20 data-[state=active]:text-sv-pink rounded-none">Songs ({songBattles.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {openBattles.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-sv-dark border border-sv-gray">
                    <p className="text-gray-500 font-body">No open battles right now. Start one to get the party going!</p>
                  </div>
                ) : (
                  openBattles.map((battle) => {
                    const isBeat = battle.type === "beat";
                    const userBattleType = user?.role === "producer" ? "beat" : "song";
                    const canJoin = !user || battle.type === userBattleType;
                    return (
                      <div key={battle.id} className={`relative bg-sv-dark border overflow-hidden transition-all duration-300 group ${canJoin ? 'border-sv-gray hover:border-sv-gold/50' : 'border-sv-gray/50 opacity-60'}`}>
                        <div className="absolute top-0 right-0 bg-sv-gold text-black font-mono text-xs px-2 py-1 font-bold">
                          OPEN
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 ${isBeat ? 'bg-sv-purple' : 'bg-sv-pink'} animate-pulse`} />
                              <span className={`text-xs font-hud font-bold uppercase tracking-widest ${isBeat ? 'text-sv-purple' : 'text-sv-pink'}`}>
                                {isBeat ? 'Beat Battle' : 'Song Battle'}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-gray-500">{battle.timeLeft}</span>
                          </div>
                          
                          <div className="flex items-center justify-center mb-3">
                            <span className="text-xs font-mono text-sv-gold bg-sv-gold/10 px-2 py-0.5 uppercase">
                              {battle.genre}
                            </span>
                          </div>
                          
                          <div className="relative aspect-square flex items-center justify-center mb-4">
                            <AudioOrb 
                              isPlaying={false} 
                              color={isBeat ? "purple" : "pink"} 
                              size="lg"
                            />
                          </div>
                          
                          <h3 className="font-punk text-white truncate text-center">{battle.left.track}</h3>
                          <p className="text-sm text-gray-500 truncate mb-4 text-center font-hud">{battle.left.artist}</p>
                          
                          {canJoin ? (
                            <button
                              className="w-full punk-btn font-punk text-sv-gold border-2 border-sv-gold py-3 hover:bg-sv-gold/10 transition-all sketch-border"
                              onClick={() => handleJoinBattle(battle.id, battle.type, battle.genre, battle.left.artist, battle.left.track)}
                              data-testid={`button-join-battle-${battle.id}`}
                            >
                              Join Battle ({BATTLE_JOIN_COST} Coins)
                            </button>
                          ) : (
                            <div className="w-full py-3 text-center text-sm text-gray-500 border-2 border-sv-gray bg-sv-gray/20">
                              {isBeat ? 'Producers Only' : 'Artists Only'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
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
                {beatBattles.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-sv-dark border border-sv-gray">
                    <p className="text-gray-500 font-body">No beat battles in progress. Start one if you're a producer!</p>
                  </div>
                ) : (
                  beatBattles.map((battle) => (
                    <Link key={battle.id} href={`/battle/${battle.id}`}>
                      <div className="cursor-pointer">
                        <BattleCard {...battle} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="songs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {songBattles.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-sv-dark border border-sv-gray">
                    <p className="text-gray-500 font-body">No song battles in progress. Start one if you're an artist!</p>
                  </div>
                ) : (
                  songBattles.map((battle) => (
                    <Link key={battle.id} href={`/battle/${battle.id}`}>
                      <div className="cursor-pointer">
                        <BattleCard {...battle} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
      <Footer />
      
      <StartBattleDialog
        open={showStartBattleDialog}
        onOpenChange={setShowStartBattleDialog}
        battleCost={BATTLE_COST}
      />

      {selectedBattleToJoin && (
        <JoinBattleDialog
          open={showJoinBattleDialog}
          onOpenChange={(open) => {
            setShowJoinBattleDialog(open);
            if (!open) setSelectedBattleToJoin(null);
          }}
          battleId={selectedBattleToJoin.id}
          battleType={selectedBattleToJoin.type}
          battleGenre={selectedBattleToJoin.genre}
          opponentName={selectedBattleToJoin.opponentName}
          opponentTrack={selectedBattleToJoin.opponentTrack}
          battleCost={BATTLE_JOIN_COST}
        />
      )}
    </div>
  );
}
