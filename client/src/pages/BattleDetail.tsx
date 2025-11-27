import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Heart, Share2, MessageCircle, Clock } from "lucide-react";
import { useState } from "react";
import { Waveform } from "@/components/battle/Waveform";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { cn } from "@/lib/utils";

// Mock Data
import cover1 from "@assets/generated_images/synthwave_geometric_album_art.png";
import cover2 from "@assets/generated_images/dark_trap_music_album_art.png";

const COMMENTS = [
  { id: 1, user: "BassMaster99", avatar: "https://github.com/shadcn.png", text: "That drop on the left track was insane! 🔥", time: "2m ago" },
  { id: 2, user: "LofiChill", avatar: "https://github.com/shadcn.png", text: "Right side has way better mixing honestly.", time: "15m ago" },
  { id: 3, user: "ProducerLife", avatar: "https://github.com/shadcn.png", text: "Both are fire but the melody on the left wins it for me.", time: "1h ago" },
  { id: 4, user: "BeatGod", avatar: "https://github.com/shadcn.png", text: "This is the best battle I've seen this week.", time: "2h ago" },
];

export default function BattleDetail() {
  const [, params] = useRoute("/battle/:id");
  const [playing, setPlaying] = useState<"left" | "right" | null>(null);
  const [voted, setVoted] = useState<"left" | "right" | null>(null);

  // Mock data based on ID (just using static for now)
  const battle = {
    id: params?.id,
    title: "Cyberpunk Vibes vs Dark Trap",
    type: "Beat Battle",
    timeLeft: "04:23:12",
    left: {
      name: "Neon Pulse",
      track: "Cyber Night",
      cover: cover1,
      votes: 1240,
      description: "A high energy synthwave track inspired by 80s sci-fi."
    },
    right: {
      name: "Grimm Beatz",
      track: "Red Smoke",
      cover: cover2,
      votes: 890,
      description: "Heavy 808s and dark melodies for the underground."
    }
  };

  const totalVotes = battle.left.votes + battle.right.votes + (voted ? 1 : 0);
  const leftVotesCurrent = battle.left.votes + (voted === "left" ? 1 : 0);
  const rightVotesCurrent = battle.right.votes + (voted === "right" ? 1 : 0);
  
  const leftPercent = (leftVotesCurrent / totalVotes) * 100;
  const rightPercent = (rightVotesCurrent / totalVotes) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Battle Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-4">
              <Clock className="w-3 h-3" /> Ends in {battle.timeLeft}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-2">{battle.title}</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">{battle.type}</p>
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
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img src={battle.left.cover} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    className="w-20 h-20 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 transition-transform"
                    onClick={() => setPlaying(playing === "left" ? null : "left")}
                  >
                    {playing === "left" ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                </div>
                {playing === "left" && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/80 to-transparent flex items-end pb-6 px-6 justify-center">
                     <Waveform color="bg-violet-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{battle.left.track}</h2>
                    <p className="text-lg text-violet-400 font-medium">{battle.left.name}</p>
                  </div>
                  <Button 
                    size="lg" 
                    className={cn(
                      "rounded-full font-bold text-md px-8 transition-all",
                      voted === "left" ? "bg-violet-500 text-white" : "bg-white/5 hover:bg-violet-500/20 text-white border border-white/10"
                    )}
                    onClick={() => setVoted("left")}
                  >
                    <Heart className={cn("w-5 h-5 mr-2", voted === "left" && "fill-current")} />
                    {voted === "left" ? "Voted" : "Vote"}
                  </Button>
                </div>
                <p className="text-muted-foreground">{battle.left.description}</p>
              </div>
            </div>

            {/* Right Contender */}
            <div className="flex flex-col gap-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img src={battle.right.cover} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                    size="icon" 
                    className="w-20 h-20 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 transition-transform"
                    onClick={() => setPlaying(playing === "right" ? null : "right")}
                  >
                    {playing === "right" ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                </div>
                {playing === "right" && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/80 to-transparent flex items-end pb-6 px-6 justify-center">
                     <Waveform color="bg-fuchsia-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{battle.right.track}</h2>
                    <p className="text-lg text-fuchsia-400 font-medium">{battle.right.name}</p>
                  </div>
                  <Button 
                    size="lg" 
                     className={cn(
                      "rounded-full font-bold text-md px-8 transition-all",
                      voted === "right" ? "bg-fuchsia-500 text-white" : "bg-white/5 hover:bg-fuchsia-500/20 text-white border border-white/10"
                    )}
                    onClick={() => setVoted("right")}
                  >
                    <Heart className={cn("w-5 h-5 mr-2", voted === "right" && "fill-current")} />
                    {voted === "right" ? "Voted" : "Vote"}
                  </Button>
                </div>
                <p className="text-muted-foreground text-right lg:text-left">{battle.right.description}</p>
              </div>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex justify-between text-sm font-bold mb-3">
              <span className="text-violet-400">{leftVotesCurrent.toLocaleString()} Votes</span>
              <span className="text-fuchsia-400">{rightVotesCurrent.toLocaleString()} Votes</span>
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
                   <AvatarImage src="https://github.com/shadcn.png" />
                   <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                   <Textarea placeholder="Join the discussion..." className="bg-black/20 border-white/10 min-h-[80px] mb-2 focus-visible:ring-violet-500" />
                   <div className="flex justify-end">
                     <Button size="sm" className="bg-white text-black hover:bg-white/90 font-bold">Post Comment</Button>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                {COMMENTS.map((comment) => (
                  <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Avatar className="w-10 h-10 border border-white/10">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{comment.user}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
