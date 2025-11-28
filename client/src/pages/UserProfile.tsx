import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Coins, TrendingUp, Loader2 } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { followUser, unfollowUser, getFollowers } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UserProfile() {
  const [, params] = useRoute("/user/:id");
  const [, setLocation] = useLocation();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const userId = parseInt(params?.id || "0");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: userId > 0,
  });

  const { data: followers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/followers`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      return res.json();
    },
    enabled: userId > 0,
  });

  useEffect(() => {
    if (currentUser && followers) {
      setIsFollowing(followers.some((f: any) => f.id === currentUser.id));
    }
  }, [followers, currentUser]);

  const followMutation = useMutation({
    mutationFn: () => followUser(currentUser!.id, userId),
    onSuccess: () => {
      setIsFollowing(true);
      toast({ title: "Followed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(currentUser!.id, userId),
    onSuccess: () => {
      setIsFollowing(false);
      toast({ title: "Unfollowed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">User not found</p>
            <Button onClick={() => setLocation("/leaderboard")}>Go to Leaderboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

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

              <div className="flex justify-center gap-8 flex-wrap mb-8">
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
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-cyan-400">{followers?.length || 0}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Zap className="w-3 h-3" /> Followers
                  </span>
                </div>
              </div>

              {!isOwnProfile && (
                <Button
                  className={isFollowing ? "bg-white/20 border border-white/30 text-white hover:bg-white/30" : "bg-white text-black hover:bg-white/90"}
                  onClick={() => {
                    if (isFollowing) {
                      unfollowMutation.mutate();
                    } else {
                      followMutation.mutate();
                    }
                  }}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  data-testid={isFollowing ? "button-unfollow" : "button-follow"}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            {/* Quick Actions */}
            {isOwnProfile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="bg-white text-black hover:bg-white/90 font-bold"
                  onClick={() => setLocation("/battles")}
                  data-testid="button-join-battle"
                >
                  Join a Battle
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => setLocation("/store")}
                  data-testid="button-visit-store"
                >
                  Visit Store
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
