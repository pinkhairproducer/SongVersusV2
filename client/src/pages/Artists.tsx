import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mic, UserPlus, User } from "lucide-react";
import { useLocation } from "wouter";

const ARTISTS = [
  { id: 1, name: "Lofi Study Girl", genre: "Lo-fi / Chill", followers: "124k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 2, name: "Rap God", genre: "Hip Hop", followers: "98k", avatar: "https://github.com/shadcn.png", trending: false },
  { id: 3, name: "Vocal Queen", genre: "R&B", followers: "85k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 4, name: "Soul Singer", genre: "Soul", followers: "42k", avatar: "https://github.com/shadcn.png", trending: false },
  { id: 5, name: "Pop Star", genre: "Pop", followers: "210k", avatar: "https://github.com/shadcn.png", trending: true },
  { id: 6, name: "Indie Voice", genre: "Alternative", followers: "33k", avatar: "https://github.com/shadcn.png", trending: false },
];

export default function Artists() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-4">Featured Artists</h1>
            <p className="text-muted-foreground text-lg">
              Discover the best vocalists, rappers, and songwriters battling for the top spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTISTS.map((artist) => (
              <div key={artist.id} className="bg-card/50 border border-white/5 rounded-xl p-6 hover:border-fuchsia-500/30 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="relative">
                    <img src={artist.avatar} alt={artist.name} className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-fuchsia-500 transition-colors" />
                    {artist.trending && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full flex items-center justify-center border border-black">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-white text-lg group-hover:text-fuchsia-400 transition-colors">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground">{artist.genre}</p>
                  </div>

                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-white">
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs font-medium text-muted-foreground">{artist.followers} Followers</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 border-white/10 hover:bg-fuchsia-500/20 hover:text-fuchsia-400 hover:border-fuchsia-500/50 text-xs"
                    onClick={() => setLocation("/profile")}
                    data-testid={`button-view-artist-${artist.id}`}
                  >
                    <User className="w-3 h-3 mr-2" /> View Profile
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
