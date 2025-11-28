import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const titleTimer = setTimeout(() => setShowTitle(true), 300);
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    const completeTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(titleTimer);
      clearTimeout(taglineTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-sv-black flex flex-col items-center justify-center overflow-hidden"
        data-testid="splash-screen"
      >
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sv-pink/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sv-purple/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="relative mb-8"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sv-pink via-sv-purple to-sv-gold animate-spin-slow relative">
              <div className="absolute inset-2 rounded-full bg-sv-black flex items-center justify-center">
                <span className="text-4xl font-cyber font-black text-white">SV</span>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-full border border-sv-pink/30 animate-ping"></div>
          </motion.div>

          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
              >
                <h1 className="text-5xl md:text-7xl font-cyber font-black">
                  <span className="text-white">SONG</span>
                  <span className="text-sv-pink">VERSUS</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showTagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-hud text-sv-gold tracking-[0.3em] uppercase text-sm mb-12"
              >
                The Underground Arena
              </motion.p>
            )}
          </AnimatePresence>

          <div className="w-64 h-1 bg-sv-gray/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sv-pink via-sv-purple to-sv-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="mt-4 font-mono text-xs text-gray-500"
          >
            LOADING ARENA...
          </motion.p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="font-hud text-gray-600 text-xs tracking-widest">SEASON 1</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
