import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Music4, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignupModal({ open, onOpenChange }: SignupModalProps) {
  const [role, setRole] = useState<"producer" | "artist" | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 border-white/10 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-center">Join SongVersus</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose your path to start battling.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <button
            onClick={() => setRole("producer")}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 group",
              role === "producer" 
                ? "border-violet-500 bg-violet-500/10" 
                : "border-white/5 bg-white/5 hover:border-violet-500/50 hover:bg-white/10"
            )}
          >
            {role === "producer" && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <Music4 className={cn("w-10 h-10 mb-3 transition-colors", role === "producer" ? "text-violet-400" : "text-muted-foreground group-hover:text-white")} />
            <span className={cn("font-bold", role === "producer" ? "text-white" : "text-muted-foreground group-hover:text-white")}>Producer</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">Beat Battles</span>
          </button>

          <button
            onClick={() => setRole("artist")}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 group",
              role === "artist" 
                ? "border-fuchsia-500 bg-fuchsia-500/10" 
                : "border-white/5 bg-white/5 hover:border-fuchsia-500/50 hover:bg-white/10"
            )}
          >
             {role === "artist" && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-fuchsia-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <Mic className={cn("w-10 h-10 mb-3 transition-colors", role === "artist" ? "text-fuchsia-400" : "text-muted-foreground group-hover:text-white")} />
            <span className={cn("font-bold", role === "artist" ? "text-white" : "text-muted-foreground group-hover:text-white")}>Artist</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">Song Battles</span>
          </button>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full bg-white text-black hover:bg-white/90 font-bold h-11" 
            disabled={!role}
            onClick={() => onOpenChange(false)}
          >
            Create Account as {role ? (role.charAt(0).toUpperCase() + role.slice(1)) : "..."}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Already have an account? <span className="text-white cursor-pointer hover:underline">Log in</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
