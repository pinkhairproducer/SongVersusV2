import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Music4, UserPlus, Play } from "lucide-react";

const PRODUCERS = [
  { id: 1, name: "Neon Pulse", genre: "Synthwave", followers: "150k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 2, name: "Grimm Beatz", genre: "Trap / Drill", followers: "89k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 3, name: "Bass Drop King", genre: "Dubstep", followers: "210k", avatar: "https://github.com/shadcn.png", trending: false },
  { id: 4, name: "Future Bass God", genre: "Future Bass", followers: "180k", avatar: "https://github.com/shadcn.png", trending: false },
  { id: 5, name: "Retro Wave", genre: "Retrowave", followers: "45k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 6, name: "HipHop Head", genre: "Boom Bap", followers: "67k", avatar: "https://github.com/shadcn.png", trending: false },
];

export default function Producers() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-4">Top Producers</h1>
            <p className="text-muted-foreground text-lg">
              The masterminds behind the beats. Connect with producers for your next hit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCERS.map((producer) => (
              <div key={producer.id} className="bg-card/50 border border-white/5 rounded-xl p-6 hover:border-violet-500/30 transition-all group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative">
                    <img src={producer.avatar} alt={producer.name} className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-violet-500 transition-colors" />
                    {producer.trending && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center border border-black">
                        <Music4 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-white text-lg group-hover:text-violet-400 transition-colors">{producer.name}</h3>
                    <p className="text-sm text-muted-foreground">{producer.genre}</p>
                  </div>

                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-white">
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs font-medium text-muted-foreground">{producer.followers} Followers</span>
                  <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/10 hover:text-white text-xs">
                    <Play className="w-3 h-3 mr-2" /> Beat Store
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
