import { motion } from "framer-motion";

export function Waveform({ color = "bg-violet-500" }: { color?: string }) {
  return (
    <div className="flex items-end gap-0.5 h-8 w-full opacity-80">
      {[...Array(20)].map((_, i) => {
        const height = Math.max(20, Math.random() * 100);
        return (
          <motion.div
            key={i}
            className={`w-1 ${color} rounded-full`}
            animate={{ height: [`${height}%`, `${Math.random() * 100}%`, `${height}%`] }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
