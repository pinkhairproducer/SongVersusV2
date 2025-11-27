import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@assets/generated_images/dark_cinematic_music_studio_background_with_neon_lighting.png";

export function Hero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/60 to-background z-10" />
        <img 
          src={heroBg} 
          alt="Studio Background" 
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-violet-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Live Battles Happening Now
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tighter text-white mb-6">
            WHERE MUSIC <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500">
              COMPETES
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The ultimate arena for producers, songwriters, and artists. 
            Upload your track, challenge opponents, and let the community decide the winner.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg h-12 px-8 rounded-full font-bold">
              Start Battling
            </Button>
            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-lg h-12 px-8 rounded-full backdrop-blur-sm">
              Listen & Vote
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 border-t border-white/5 pt-8"
        >
          <div>
            <div className="text-3xl font-bold text-white font-heading">24k+</div>
            <div className="text-sm text-muted-foreground">Active Artists</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-heading">12k+</div>
            <div className="text-sm text-muted-foreground">Battles Hosted</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-heading">$50k</div>
            <div className="text-sm text-muted-foreground">Prize Money Won</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-heading">1M+</div>
            <div className="text-sm text-muted-foreground">Votes Cast</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
