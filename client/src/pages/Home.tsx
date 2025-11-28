import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { BattleCard } from "@/components/battle/BattleCard";
import { ArrowRight, Zap, Trophy, Crown } from "lucide-react";
import { Link } from "wouter";

import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";
import cover3 from "@assets/generated_images/lo-fi_anime_album_art.png";
import cover4 from "@assets/generated_images/future_bass_crystal_album_art.png";

const FEATURED_BATTLES = [
  {
    id: 1,
    timeLeft: "04:23:12",
    type: "beat",
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
    type: "song",
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
    type: "beat",
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
            {FEATURED_BATTLES.map((battle) => (
              <Link key={battle.id} href={`/battle/${battle.id}`}>
                <BattleCard {...battle} />
              </Link>
            ))}
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
                  {TOP_ARTISTS.map((artist) => (
                    <div key={artist.rank} className="flex items-center gap-4 p-3 hover:bg-sv-purple/10 border border-transparent hover:border-sv-purple/30 transition-all group cursor-pointer">
                      <div className={`font-cyber font-bold w-8 text-center ${artist.rank === 1 ? 'text-sv-gold' : artist.rank === 2 ? 'text-gray-300' : artist.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {artist.rank === 1 ? <Crown className="w-6 h-6 fill-sv-gold text-sv-gold mx-auto" /> : `#${artist.rank}`}
                      </div>
                      <img src={artist.avatar} alt={artist.name} className="w-10 h-10 border border-sv-gray" />
                      <div className="flex-grow">
                        <h4 className="font-punk text-white group-hover:text-sv-pink transition-colors">{artist.name}</h4>
                        <p className="text-xs text-gray-500 font-hud uppercase tracking-widest">{artist.wins} Wins</p>
                      </div>
                      <div className="font-mono text-sm font-bold text-sv-gold">{artist.score.toLocaleString()}</div>
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
