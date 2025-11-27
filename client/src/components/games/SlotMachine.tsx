import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Coins, X, RotateCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SYMBOLS = ["🍒", "🍋", "💎", "7️⃣", "🔔", "🍇"];
const COST_PER_SPIN = 50;

export function SlotMachine() {
  const [isOpen, setIsOpen] = useState(false);
  const [reels, setReels] = useState(["7️⃣", "7️⃣", "7️⃣"]);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(1250); // Mock wallet
  const [win, setWin] = useState(0);

  const spin = () => {
    if (coins < COST_PER_SPIN) return;
    
    setSpinning(true);
    setWin(0);
    setCoins(c => c - COST_PER_SPIN);

    // Animation sequence
    let interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      setReels(finalReels);
      setSpinning(false);
      checkWin(finalReels);
    }, 2000);
  };

  const checkWin = (finalReels: string[]) => {
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const reward = 500;
      setWin(reward);
      setCoins(c => c + reward);
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
      const reward = 50;
      setWin(reward);
      setCoins(c => c + reward);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-72 bg-black/90 border-2 border-yellow-500/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-yellow-500/20 overflow-hidden flex flex-col relative"
          >
            {/* Casino Header */}
            <div className="p-3 bg-linear-to-r from-yellow-600 to-yellow-500 flex items-center justify-between">
              <div className="flex items-center gap-2 text-black font-bold">
                <Coins className="w-4 h-4" />
                <span>Lucky Slots</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-black hover:bg-black/10" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Machine Body */}
            <div className="p-6 flex flex-col items-center gap-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              
              {/* Reels */}
              <div className="flex gap-2 p-3 bg-black border-4 border-yellow-600 rounded-lg shadow-inner">
                {reels.map((symbol, i) => (
                  <div key={i} className="w-12 h-16 bg-white rounded flex items-center justify-center text-3xl border-b-4 border-gray-300 shadow-inner">
                    {symbol}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs font-mono font-bold text-yellow-400 uppercase">
                  <span>Cost: {COST_PER_SPIN}</span>
                  <span>Wallet: {coins}</span>
                </div>
                
                <Button 
                  onClick={spin} 
                  disabled={spinning || coins < COST_PER_SPIN}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  {spinning ? "Spinning..." : "SPIN!"}
                </Button>
              </div>

              {/* Win Display */}
              <AnimatePresence>
                {win > 0 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 pointer-events-none"
                  >
                    <div className="text-center">
                      <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-bounce" />
                      <div className="text-2xl font-black text-yellow-400 drop-shadow-lg">BIG WIN!</div>
                      <div className="text-xl font-bold text-white">+{win} Coins</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="lg" 
        className={`rounded-full h-14 w-14 shadow-lg shadow-yellow-500/20 transition-all duration-300 border-2 border-yellow-500 ${isOpen ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-black text-yellow-500 hover:scale-110'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Coins className="w-6 h-6 animate-pulse" />}
      </Button>
    </div>
  );
}
