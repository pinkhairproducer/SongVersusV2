import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BattleCard } from "@/components/battle/BattleCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";

// Mock Data (Reusing images for consistency)
import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";
import { Link } from "wouter";

const ALL_BATTLES = [
  {
    id: 1,
    type: "beat",
    timeLeft: "04:23:12",
    left: { artist: "Neon Pulse", track: "Cyber Night", cover: cover1, votes: 1240, isLeading: true },
    right: { artist: "Grimm Beatz", track: "Red Smoke", cover: cover2, votes: 890 }
  },
  {
    id: 2,
    type: "song",
    timeLeft: "01:15:00",
    left: { artist: "Lofi Study Girl", track: "Rainy Day", cover: cover3, votes: 3400 },
    right: { artist: "Bass Drop King", track: "Crystal Shards", cover: cover4, votes: 3650, isLeading: true }
  },
  {
    id: 3,
    type: "beat",
    timeLeft: "12:00:00",
    left: { artist: "Synthwave Pro", track: "Retro Racer", cover: cover1, votes: 150 },
    right: { artist: "Future Bass God", track: "Neon Lights", cover: cover4, votes: 120 }
  },
   {
    id: 4,
    type: "song",
    timeLeft: "23:45:00",
    left: { artist: "Vocal Queen", track: "High Notes", cover: cover2, votes: 500 },
    right: { artist: "Rap God", track: "Fast Lane", cover: cover3, votes: 620, isLeading: true }
  }
];

export default function Battles() {
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
                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 rounded-full shadow-xl shadow-white/10">
                  Start a New Battle
                </Button>
             </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-black/20 border border-white/10 p-1 rounded-lg mb-8 w-full md:w-auto flex-wrap h-auto">
              <TabsTrigger value="all" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white">All Battles</TabsTrigger>
              <TabsTrigger value="beats" className="flex-1 md:flex-none data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">Beat Battles (Producers)</TabsTrigger>
              <TabsTrigger value="songs" className="flex-1 md:flex-none data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-fuchsia-300">Song Battles (Artists)</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ALL_BATTLES.map((battle) => (
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
                {ALL_BATTLES.filter(b => b.type === "beat").map((battle) => (
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
                {ALL_BATTLES.filter(b => b.type === "song").map((battle) => (
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
