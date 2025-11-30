import { useShouldReduceMotion } from "@/hooks/useIsMobile";

export function Waveform({ color = "bg-violet-500" }: { color?: string }) {
  const reduceMotion = useShouldReduceMotion();
  
  return (
    <div className="flex items-end gap-0.5 h-8 w-full opacity-80">
      {[...Array(20)].map((_, i) => {
        const height = Math.max(20, Math.random() * 100);
        return (
          <div
            key={i}
            className={`w-1 ${color} rounded-full`}
            style={{ height: reduceMotion ? `${height}%` : `${height}%` }}
          />
        );
      })}
    </div>
  );
}
