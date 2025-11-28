import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchBattles } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function MyBattles() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { data: battlesData, isLoading } = useQuery({
    queryKey: ["battles"],
    queryFn: fetchBattles,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to login to view your battles</p>
            <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-white/90">
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const userBattles = (battlesData || []).filter(
    battle => battle.leftUserId === user.id || battle.rightUserId === user.id
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">My Battles</h1>
            <p className="text-muted-foreground">Battles you've participated in</p>
          </div>

          {userBattles.length === 0 ? (
            <div className="text-center py-12 bg-card/30 border border-white/5 rounded-xl">
              <p className="text-muted-foreground mb-4">You haven't participated in any battles yet</p>
              <Button 
                className="bg-white text-black hover:bg-white/90 font-bold"
                onClick={() => setLocation("/battles")}
              >
                Start Your First Battle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userBattles.map((battle) => (
                <Link key={battle.id} href={`/battle/${battle.id}`}>
                  <div className="bg-card/50 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Battle Type</p>
                        <p className="text-white font-bold capitalize">{battle.type}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Your Side</p>
                        <p className="text-white font-mono text-sm">
                          {battle.leftUserId === user.id ? battle.leftArtist : battle.rightArtist || "Waiting..."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className={`font-bold text-sm ${battle.rightArtist ? "text-green-400" : "text-yellow-400"}`}>
                          {battle.rightArtist ? "Complete" : "Open"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Votes</p>
                        <p className="text-white font-mono">
                          {battle.leftUserId === user.id ? `${battle.leftVotes} vs ${battle.rightVotes}` : `${battle.rightVotes} vs ${battle.leftVotes}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
