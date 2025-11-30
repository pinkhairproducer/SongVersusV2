import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Clock, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { AudioReactiveSphere } from "@/components/battle/AudioReactiveSphere";
import { AudioPlayer } from "@/components/battle/AudioPlayer";
import { ProfileCard } from "@/components/battle/ProfileCard";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBattle, fetchUserVote, voteOnBattle, fetchComments, postComment, fetchUser } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

export default function BattleDetail() {
  const [, params] = useRoute("/battle/:id");
  const battleId = parseInt(params?.id || "0");
  const [playing, setPlaying] = useState<"left" | "right" | null>(null);
  const [commentText, setCommentText] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: battle, isLoading: battleLoading } = useQuery({
    queryKey: ["battle", battleId],
    queryFn: () => fetchBattle(battleId),
  });

  const { data: userVote } = useQuery({
    queryKey: ["vote", battleId, user?.id],
    queryFn: () => user ? fetchUserVote(battleId, user.id) : null,
    enabled: !!user,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", battleId],
    queryFn: () => fetchComments(battleId),
    refetchInterval: 5000,
  });

  const { data: leftUser } = useQuery({
    queryKey: ["user", battle?.leftUserId],
    queryFn: () => battle?.leftUserId ? fetchUser(battle.leftUserId) : null,
    enabled: !!battle?.leftUserId,
  });

  const { data: rightUser } = useQuery({
    queryKey: ["user", battle?.rightUserId],
    queryFn: () => battle?.rightUserId ? fetchUser(battle.rightUserId) : null,
    enabled: !!battle?.rightUserId,
  });

  const voteMutation = useMutation({
    mutationFn: (side: "left" | "right") => voteOnBattle(battleId, user!.id, side),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["battle", battleId] });
      queryClient.invalidateQueries({ queryKey: ["vote", battleId, user?.id] });
      toast({
        title: "Vote Recorded!",
        description: "Your vote has been counted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Vote Failed",
        description: error.message || "Could not record vote",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => postComment(battleId, user!.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", battleId] });
      setCommentText("");
      toast({
        title: "Comment Posted!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleVote = (side: "left" | "right") => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(side);
  };

  const handleLeftPlayStateChange = useCallback((isPlaying: boolean) => {
    if (isPlaying) {
      setPlaying("left");
    } else if (playing === "left") {
      setPlaying(null);
    }
  }, [playing]);

  const handleRightPlayStateChange = useCallback((isPlaying: boolean) => {
    if (isPlaying) {
      setPlaying("right");
    } else if (playing === "right") {
      setPlaying(null);
    }
  }, [playing]);

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (battleLoading || !battle) {
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

  // Calculate time left
  const now = new Date();
  const endsAt = battle.endsAt ? new Date(battle.endsAt) : new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const timeLeft = Math.max(0, endsAt.getTime() - now.getTime());
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const timeLeftStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const totalVotes = battle.leftVotes + battle.rightVotes;
  const leftPercent = totalVotes > 0 ? (battle.leftVotes / totalVotes) * 100 : 50;
  const rightPercent = totalVotes > 0 ? (battle.rightVotes / totalVotes) * 100 : 50;

  const voted = userVote?.side as "left" | "right" | null | undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Battle Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-4">
              <Clock className="w-3 h-3" /> Ends in {timeLeftStr}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-2">
              {battle.leftArtist} vs {battle.rightArtist || "TBD"}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
              {battle.type === "beat" ? "Beat Battle" : "Song Battle"}
            </p>
          </div>

          {/* The Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 max-w-6xl mx-auto relative mb-20">
            
            {/* VS Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-black border-4 border-background shadow-2xl shadow-violet-500/20 flex items-center justify-center z-20">
                <span className="font-black font-heading italic text-white text-2xl">VS</span>
              </div>
              <div className="h-full w-px bg-white/5 absolute top-0 bottom-0 -z-10" />
            </div>

            {/* Left Contender */}
            <div className="flex flex-col gap-6">
              {leftUser && (
                <ProfileCard
                  userId={leftUser.id}
                  name={leftUser.name || battle.leftArtist}
                  avatar={leftUser.profileImageUrl}
                  role={leftUser.role || "artist"}
                  level={leftUser.level || 1}
                  xp={leftUser.xp || 0}
                  wins={leftUser.wins || 0}
                  membership={leftUser.membership || "free"}
                  foundersBadge={leftUser.foundersBadge || false}
                  side="left"
                  isWinner={battle.status === "completed" && battle.leftVotes > battle.rightVotes}
                />
              )}
              
              <div className="relative aspect-square flex items-center justify-center overflow-hidden rounded-2xl">
                <AudioReactiveSphere 
                  isPlaying={playing === "left"}
                  color="cyan"
                  size={280}
                />
              </div>
              
              {battle.leftAudio && (
                <AudioPlayer
                  audioUrl={battle.leftAudio}
                  trackName={battle.leftTrack}
                  artistName={battle.leftArtist}
                  color="cyan"
                  isPlaying={playing === "left"}
                  onPlayStateChange={handleLeftPlayStateChange}
                />
              )}

              <div className="flex items-center justify-center mt-4">
                <Button 
                  size="lg" 
                  className={cn(
                    "rounded-full font-bold text-md px-8 transition-all",
                    voted === "left" ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-violet-500/20 text-white border border-white/10"
                  )}
                  onClick={() => handleVote("left")}
                  disabled={!!voted}
                  data-testid="button-vote-left"
                >
                  <Heart className={cn("w-5 h-5 mr-2", voted === "left" && "fill-current")} />
                  {voted === "left" ? "Voted" : "Vote"}
                </Button>
              </div>
            </div>

            {/* Right Contender */}
            <div className="flex flex-col gap-6">
              {rightUser && (
                <ProfileCard
                  userId={rightUser.id}
                  name={rightUser.name || battle.rightArtist || "Unknown"}
                  avatar={rightUser.profileImageUrl}
                  role={rightUser.role || "artist"}
                  level={rightUser.level || 1}
                  xp={rightUser.xp || 0}
                  wins={rightUser.wins || 0}
                  membership={rightUser.membership || "free"}
                  foundersBadge={rightUser.foundersBadge || false}
                  side="right"
                  isWinner={battle.status === "completed" && battle.rightVotes > battle.leftVotes}
                />
              )}
              
              <div className="relative aspect-square flex items-center justify-center overflow-hidden rounded-2xl">
                <AudioReactiveSphere 
                  isPlaying={playing === "right"}
                  color="fuchsia"
                  size={280}
                />
              </div>
              
              {battle.rightAudio ? (
                <AudioPlayer
                  audioUrl={battle.rightAudio}
                  trackName={battle.rightTrack || "Unknown Track"}
                  artistName={battle.rightArtist || "Unknown Artist"}
                  color="fuchsia"
                  isPlaying={playing === "right"}
                  onPlayStateChange={handleRightPlayStateChange}
                />
              ) : (
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-gray-400">Waiting for opponent to join...</p>
                </div>
              )}

              <div className="flex items-center justify-center mt-4">
                <Button 
                  size="lg" 
                  className={cn(
                    "rounded-full font-bold text-md px-8 transition-all",
                    voted === "right" ? "bg-fuchsia-500 text-white" : "bg-white/5 hover:bg-fuchsia-500/20 text-white border border-white/10"
                  )}
                  onClick={() => handleVote("right")}
                  disabled={!!voted || !battle.rightArtist}
                  data-testid="button-vote-right"
                >
                  <Heart className={cn("w-5 h-5 mr-2", voted === "right" && "fill-current")} />
                  {voted === "right" ? "Voted" : "Vote"}
                </Button>
              </div>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex justify-between text-sm font-bold mb-3">
              <span className="text-violet-400">{battle.leftVotes.toLocaleString()} Votes</span>
              <span className="text-fuchsia-400">{battle.rightVotes.toLocaleString()} Votes</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex relative">
              <motion.div 
                initial={{ width: "50%" }}
                animate={{ width: `${leftPercent}%` }}
                className="h-full bg-violet-500 relative"
              >
                 <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </motion.div>
              <motion.div 
                initial={{ width: "50%" }}
                animate={{ width: `${rightPercent}%` }}
                className="h-full bg-fuchsia-500"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold font-heading text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Battle Chat
            </h3>
            
            <div className="bg-card/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm mb-8">
              <div className="flex gap-4 mb-6">
                <Avatar>
                   <AvatarImage src={user?.profileImageUrl || undefined} />
                   <AvatarFallback>{user?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                   <Textarea 
                     placeholder={user ? "Join the discussion..." : "Login to comment"}
                     className="bg-black/20 border-white/10 min-h-[80px] mb-2 focus-visible:ring-violet-500"
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     disabled={!user}
                     data-testid="input-comment"
                   />
                   <div className="flex justify-end">
                     <Button 
                       size="sm" 
                       className="bg-white text-black hover:bg-white/90 font-bold"
                       onClick={handleComment}
                       disabled={!user || !commentText.trim()}
                       data-testid="button-post-comment"
                     >
                       Post Comment
                     </Button>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                {(comments || []).map((comment) => {
                  const time = new Date(comment.createdAt);
                  const now = new Date();
                  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
                  const timeAgo = diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 3600)}h ago`;

                  return (
                    <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid={`comment-${comment.id}`}>
                      <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
