import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Coins, TrendingUp, Loader2, Users, UserPlus, Swords } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MembershipBadge } from "@/components/MembershipBadge";
import { FoundersBadge } from "@/components/FoundersBadge";
import { ChallengeDialog } from "@/components/ChallengeDialog";

export default function UserProfile() {
  const [, params] = useRoute("/user/:id");
  const [, setLocation] = useLocation();
  const { user: currentUser } = useUser();
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const { data: followers = [] } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/followers`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      return res.json();
    },
    enabled: userId > 0,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/following`);
      if (!res.ok) throw new Error("Failed to fetch following");
      return res.json();
    },
    enabled: userId > 0,
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ["followStatus", userId],
    queryFn: async () => {
      const res = await fetch(`/api/follow/${userId}/status`, { credentials: "include" });
      if (!res.ok) return false;
      const data = await res.json();
      return data.isFollowing;
    },
    enabled: !!currentUser && currentUser.id !== userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/follow/${userId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to follow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
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
    mutationFn: async () => {
      const res = await fetch(`/api/follow/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to unfollow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers", userId] });
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
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-4xl font-bold">{(user.name || "?")[0]}</AvatarFallback>
              </Avatar>

              <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
                <h1 className="text-4xl font-bold text-white">{user.name || "Unknown User"}</h1>
                {user.foundersBadge && <FoundersBadge size="md" />}
                <MembershipBadge membership={user.membership} size="md" />
              </div>
              <p className="text-violet-400 font-mono mb-2 capitalize">
                {user.role === "producer" ? "🎛️ Producer" : "🎤 Artist"} • Level {user.level || 1}
              </p>
              {user.bio && (
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">{user.bio}</p>
              )}

              <div className="flex justify-center gap-8 flex-wrap mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-400">{(user.xp || 0).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> XP
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-violet-400">{user.wins || 0}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Trophy className="w-3 h-3" /> Wins
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-sv-pink">{followers.length}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" /> Followers
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-cyan-400">{following.length}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <UserPlus className="w-3 h-3" /> Following
                  </span>
                </div>
              </div>

              {!isOwnProfile && currentUser && (
                <div className="flex gap-3 justify-center">
                  <Button
                    className={isFollowing ? "bg-white/20 border border-white/30 text-white hover:bg-white/30" : "bg-sv-pink text-black hover:bg-sv-pink/80"}
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
                  <Button
                    className="bg-gradient-to-r from-sv-purple to-sv-pink text-white hover:opacity-90"
                    onClick={() => setShowChallengeDialog(true)}
                    data-testid="button-challenge"
                  >
                    <Swords className="w-4 h-4 mr-2" />
                    Challenge
                  </Button>
                </div>
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

      {user && !isOwnProfile && (
        <ChallengeDialog
          open={showChallengeDialog}
          onOpenChange={setShowChallengeDialog}
          targetUser={{
            id: user.id,
            name: user.name || "Unknown User",
            role: user.role || "artist",
          }}
        />
      )}
    </div>
  );
}
