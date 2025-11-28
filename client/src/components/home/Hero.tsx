import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Play, Mic2, Disc3 } from "lucide-react";
import heroBg from "@assets/generated_images/dark_cinematic_music_studio_background_with_neon_lighting.png";

export function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-16">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none overflow-x-hidden"></div>
      
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sv-black via-sv-black/90 to-sv-black z-10" />
        <img 
          src={heroBg} 
          alt="Studio Background" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Animated Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sv-pink/20 rounded-full blur-3xl animate-[blob_7s_infinite]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sv-purple/20 rounded-full blur-3xl animate-[blob_7s_infinite_2s]"></div>

      {/* Content */}
      <div className="relative z-10 px-4 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Season Tag */}
          <div className="relative inline-block mb-8">
            <span className="absolute -top-2 -right-8 md:-right-16 text-lg md:text-2xl font-punk text-sv-gold rotate-12 bg-sv-black px-2 sketch-border">
              SEASON 1
            </span>
          </div>
          
          {/* Main Title */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-9xl font-cyber font-black text-white leading-none">
              SONG
            </h1>
            <h1 className="text-6xl md:text-9xl font-cyber font-black text-sv-pink leading-none">
              VERSUS
            </h1>
          </div>
          
          <p className="font-body text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            The underground arena where <span className="text-white font-bold">Artists</span> and <span className="text-white font-bold">Producers</span> clash. 
            Drop tracks. Win <span className="text-sv-gold font-bold">ORBs</span>. Become Legend.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/battles">
              <button className="group relative px-8 py-4 bg-sv-pink text-black font-cyber font-bold text-xl uppercase tracking-wider skew-x-[-12deg] hover:glow-pink transition-all">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="block skew-x-[12deg] flex items-center gap-2">
                  Start Battle <Zap className="w-5 h-5 fill-black" />
                </span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white"></div>
              </button>
            </Link>
            <Link href="/battles">
              <button className="font-punk text-white text-xl border-b-2 border-sv-purple hover:text-sv-purple transition-colors rotate-2">
                Watch Top Battles
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-8"
        >
          <h3 className="text-center font-hud text-sv-gold tracking-[0.5em] mb-8 uppercase text-sm">Choose Your Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Artist Card */}
            <Link href="/artists">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-sv-pink/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-sv-dark border border-sv-gray p-8 h-64 relative overflow-hidden flex flex-col items-center justify-end group-hover:border-sv-pink transition-colors">
                  <div className="absolute inset-0 opacity-30 flex items-center justify-center">
                    <Mic2 className="w-48 h-48 text-sv-pink stroke-[0.5] sketch-border group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-punk text-white mb-2 group-hover:text-sv-pink transition-colors text-outline-pink">ARTIST</h2>
                    <p className="font-hud text-gray-400 tracking-widest text-sm bg-sv-black/80 px-2 py-1">VOCALS • RAP • LYRICS</p>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-sv-pink text-black font-bold font-mono text-xs px-2 py-1 rotate-3">SELECT</div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Producer Card */}
            <Link href="/producers">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-sv-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-sv-dark border border-sv-gray p-8 h-64 relative overflow-hidden flex flex-col items-center justify-end group-hover:border-sv-purple transition-colors">
                  <div className="absolute inset-0 opacity-30 flex items-center justify-center">
                    <Disc3 className="w-48 h-48 text-sv-purple stroke-[0.5] sketch-border group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-punk text-white mb-2 group-hover:text-sv-purple transition-colors text-outline-purple">PRODUCER</h2>
                    <p className="font-hud text-gray-400 tracking-widest text-sm bg-sv-black/80 px-2 py-1">BEATS • LOOPS • MIX</p>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-sv-purple text-white font-bold font-mono text-xs px-2 py-1 -rotate-2">SELECT</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 border-t border-sv-gray pt-8"
        >
          <div>
            <div className="text-3xl font-cyber font-bold text-white">24K+</div>
            <div className="text-sm text-gray-500 font-hud uppercase tracking-widest">Artists</div>
          </div>
          <div>
            <div className="text-3xl font-cyber font-bold text-white">12K+</div>
            <div className="text-sm text-gray-500 font-hud uppercase tracking-widest">Battles</div>
          </div>
          <div>
            <div className="text-3xl font-cyber font-bold text-sv-gold">18K+</div>
            <div className="text-sm text-gray-500 font-hud uppercase tracking-widest">Producers</div>
          </div>
          <div>
            <div className="text-3xl font-cyber font-bold text-white">1M+</div>
            <div className="text-sm text-gray-500 font-hud uppercase tracking-widest">Votes</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
