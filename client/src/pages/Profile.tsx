import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Coins, TrendingUp, Edit } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { useState } from "react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

export default function Profile() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to login to view your profile</p>
            <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-white/90">
              Go Home
            </Button>
          </div>
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
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-8 text-center mb-8 backdrop-blur-sm">
              <Avatar className="w-32 h-32 border-4 border-violet-500 mx-auto mb-6">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              
              <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-violet-400 font-mono mb-6 capitalize">
                {user.role === "producer" ? "🎛️ Producer" : "🎤 Artist"}
              </p>
              {user.bio && (
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">{user.bio}</p>
              )}
              
              <div className="flex justify-center gap-8 flex-wrap">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-400">{user.xp.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> XP
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-violet-400">{user.wins}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Trophy className="w-3 h-3" /> Wins
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-green-400">{user.coins.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Coins className="w-3 h-3" /> Coins
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-white text-black hover:bg-white/90 font-bold" onClick={() => setLocation("/battles")} data-testid="button-join-battle">
                Join a Battle
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => setLocation("/store")} data-testid="button-visit-store">
                Visit Store
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => setEditOpen(true)} data-testid="button-edit-profile">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <EditProfileDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              userId={user.id}
              currentAvatar={user.avatar}
              currentBio={user.bio || ""}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
