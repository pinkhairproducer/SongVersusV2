import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { BattleCard } from "@/components/battle/BattleCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";

const FEATURED_BATTLES = [
  {
    id: 1,
    timeLeft: "04:23:12",
    left: {
      artist: "Neon Pulse",
      track: "Cyber Night",
      cover: cover1,
      votes: 1240,
      isLeading: true
    },
    right: {
      artist: "Grimm Beatz",
      track: "Red Smoke",
      cover: cover2,
      votes: 890
    }
  },
  {
    id: 2,
    timeLeft: "01:15:00",
    left: {
      artist: "Lofi Study Girl",
      track: "Rainy Day",
      cover: cover3,
      votes: 3400
    },
    right: {
      artist: "Bass Drop King",
      track: "Crystal Shards",
      cover: cover4,
      votes: 3650,
      isLeading: true
    }
  },
  {
    id: 3,
    timeLeft: "12:00:00",
    left: {
      artist: "Synthwave Pro",
      track: "Retro Racer",
      cover: cover1,
      votes: 150
    },
    right: {
      artist: "Future Bass God",
      track: "Neon Lights",
      cover: cover4,
      votes: 120
    }
  }
];

const TOP_ARTISTS = [
  { rank: 1, name: "Bass Drop King", wins: 42, score: 9850, avatar: "https://github.com/shadcn.png" },
  { rank: 2, name: "Lofi Study Girl", wins: 38, score: 9200, avatar: "https://github.com/shadcn.png" },
  { rank: 3, name: "Neon Pulse", wins: 35, score: 8900, avatar: "https://github.com/shadcn.png" },
  { rank: 4, name: "Grimm Beatz", wins: 30, score: 8500, avatar: "https://github.com/shadcn.png" },
  { rank: 5, name: "Synthwave Pro", wins: 28, score: 8100, avatar: "https://github.com/shadcn.png" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        {/* Trending Battles Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold font-heading text-white mb-2 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                Trending Battles
              </h2>
              <p className="text-muted-foreground">The hottest matchups happening right now.</p>
            </div>
            <Button variant="link" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_BATTLES.map((battle) => (
              <BattleCard key={battle.id} {...battle} />
            ))}
          </div>
        </section>

        {/* Top Producers Section (Leaderboard Teaser) */}
        <section className="py-20 bg-black/20 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold font-heading text-white mb-6">
                  Top Producers <br />
                  <span className="text-muted-foreground">of the Week</span>
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Climb the ranks by winning battles. Top producers earn exclusive badges, 
                  cash prizes, and features on our social channels.
                </p>
                <Button className="bg-white text-black hover:bg-white/90 font-bold">
                  View Full Leaderboard
                </Button>
              </div>

              <div className="bg-card/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  {TOP_ARTISTS.map((artist) => (
                    <div key={artist.rank} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer">
                      <div className="font-mono font-bold text-muted-foreground w-6 text-center">{artist.rank}</div>
                      <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full border border-white/10" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{artist.name}</h4>
                        <p className="text-xs text-muted-foreground">{artist.wins} Wins</p>
                      </div>
                      <div className="font-mono text-sm font-medium text-white">{artist.score.toLocaleString()} pts</div>
                    </div>
                  ))}
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
