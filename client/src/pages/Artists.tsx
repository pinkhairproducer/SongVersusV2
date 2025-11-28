import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mic, UserPlus, User, UserCheck, Loader2, Crown, Star } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

async function fetchArtists(): Promise<UserType[]> {
  const response = await fetch("/api/users/role/artist");
  if (!response.ok) throw new Error("Failed to fetch artists");
  return response.json();
}

async function checkFollowStatus(userId: number): Promise<boolean> {
  const response = await fetch(`/api/follow/${userId}/status`, {
    credentials: "include",
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data.isFollowing;
}

function MembershipBadge({ membership }: { membership: string }) {
  if (membership === "elite") {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-sv-gold/20 border border-sv-gold/50 rounded text-sv-gold text-xs font-bold">
        <Crown className="w-3 h-3" />
        ELITE
      </div>
    );
  }
  if (membership === "pro") {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-sv-purple/20 border border-sv-purple/50 rounded text-sv-purple text-xs font-bold">
        <Star className="w-3 h-3" />
        PRO
      </div>
    );
  }
  return null;
}

function ArtistCard({ artist, currentUserId }: { artist: UserType; currentUserId?: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: isFollowing = false } = useQuery({
    queryKey: ["followStatus", artist.id],
    queryFn: () => checkFollowStatus(artist.id),
    enabled: !!currentUserId && currentUserId !== artist.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/follow/${artist.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to follow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", artist.id] });
      toast({ title: "Followed!", description: `You are now following ${artist.name}` });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/follow/${artist.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to unfollow");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", artist.id] });
      toast({ title: "Unfollowed", description: `You unfollowed ${artist.name}` });
    },
  });

  const handleFollowClick = () => {
    if (!currentUserId) {
      toast({ title: "Login Required", description: "Please login to follow artists", variant: "destructive" });
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="bg-card/50 border border-white/5 rounded-xl p-6 hover:border-fuchsia-500/30 transition-all group relative overflow-hidden" data-testid={`artist-card-${artist.id}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative">
          <img 
            src={artist.profileImageUrl || "https://github.com/shadcn.png"} 
            alt={artist.name || "Artist"} 
            className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-fuchsia-500 transition-colors object-cover" 
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 rounded-full flex items-center justify-center border border-black">
            <Mic className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white text-lg group-hover:text-fuchsia-400 transition-colors truncate">
              {artist.name || "Unknown Artist"}
            </h3>
            <MembershipBadge membership={artist.membership} />
          </div>
          <p className="text-sm text-muted-foreground">Level {artist.level} • {artist.wins} wins</p>
        </div>

        {currentUserId !== artist.id && (
          <Button 
            size="icon" 
            variant="ghost" 
            className={isFollowing ? "text-fuchsia-400" : "text-muted-foreground hover:text-white"}
            onClick={handleFollowClick}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            data-testid={`button-follow-${artist.id}`}
          >
            {isFollowing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </Button>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-xs font-medium text-muted-foreground">{artist.xp} XP</span>
        <Link href={`/user/${artist.id}`}>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 border-white/10 hover:bg-fuchsia-500/20 hover:text-fuchsia-400 hover:border-fuchsia-500/50 text-xs"
            data-testid={`button-view-artist-${artist.id}`}
          >
            <User className="w-3 h-3 mr-2" /> View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Artists() {
  const { user } = useUser();

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: fetchArtists,
  });

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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No artists found yet. Be the first to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
