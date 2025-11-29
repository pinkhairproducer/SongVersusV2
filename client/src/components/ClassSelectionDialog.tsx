import { motion } from "framer-motion";
import { Mic, Music4, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface ClassSelectionDialogProps {
  userId: number;
  onComplete: () => void;
}

export function ClassSelectionDialog({ userId, onComplete }: ClassSelectionDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"artist" | "producer" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleContinueToRole = () => {
    if (displayName.trim().length < 2) {
      toast({
        title: "Name Required",
        description: "Please enter a display name (at least 2 characters)",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedRole || !displayName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole, name: displayName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to set role");
      
      toast({
        title: "Welcome to SongVersus!",
        description: `You're now registered as ${displayName} (${selectedRole === "artist" ? "Artist" : "Producer"})`,
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      data-testid="class-selection-dialog"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-sv-dark border border-sv-gray rounded-lg p-8 max-w-xl w-full text-center"
      >
        {step === 1 ? (
          <>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-sv-pink to-sv-purple">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-cyber font-black text-white mb-2">
              WELCOME TO <span className="text-sv-pink">SONGVERSUS</span>
            </h2>
            <p className="text-gray-400 mb-8">
              What should we call you in the arena?
            </p>

            <div className="mb-8">
              <Input
                type="text"
                placeholder="Enter your display name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-sv-black border-sv-gray text-white text-center text-lg py-6 focus:border-sv-pink"
                maxLength={30}
                data-testid="input-display-name"
              />
              <p className="text-xs text-gray-500 mt-2">This is how other users will see you</p>
            </div>

            <motion.button
              whileHover={{ scale: displayName.trim().length >= 2 ? 1.02 : 1 }}
              whileTap={{ scale: displayName.trim().length >= 2 ? 0.98 : 1 }}
              onClick={handleContinueToRole}
              disabled={displayName.trim().length < 2}
              className={`w-full py-4 rounded-lg font-cyber font-bold text-lg transition-all ${
                displayName.trim().length >= 2
                  ? "bg-gradient-to-r from-sv-pink to-sv-purple text-white cursor-pointer hover:opacity-90"
                  : "bg-sv-gray text-gray-500 cursor-not-allowed"
              }`}
              data-testid="button-continue-to-role"
            >
              CONTINUE
            </motion.button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-cyber font-black text-white mb-2">
              CHOOSE YOUR <span className="text-sv-pink">CLASS</span>
            </h2>
            <p className="text-gray-400 mb-2">
              Hey <span className="text-sv-gold font-bold">{displayName}</span>! What's your specialty?
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Artists compete in song battles, Producers compete in beat battles
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole("artist")}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedRole === "artist"
                    ? "border-sv-pink bg-sv-pink/10"
                    : "border-sv-gray hover:border-sv-pink/50"
                }`}
                data-testid="button-select-artist"
              >
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  selectedRole === "artist" ? "bg-sv-pink" : "bg-sv-gray"
                }`}>
                  <Mic className={`w-10 h-10 ${selectedRole === "artist" ? "text-black" : "text-white"}`} />
                </div>
                <h3 className="text-xl font-cyber font-bold text-white mb-2">ARTIST</h3>
                <p className="text-sm text-gray-400">
                  Vocalists, rappers, and songwriters
                </p>
                <p className="text-xs text-sv-pink mt-2 font-bold">Song Battles</p>
                {selectedRole === "artist" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sv-pink rounded-full flex items-center justify-center">
                    <span className="text-black text-lg">✓</span>
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole("producer")}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedRole === "producer"
                    ? "border-sv-purple bg-sv-purple/10"
                    : "border-sv-gray hover:border-sv-purple/50"
                }`}
                data-testid="button-select-producer"
              >
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  selectedRole === "producer" ? "bg-sv-purple" : "bg-sv-gray"
                }`}>
                  <Music4 className={`w-10 h-10 ${selectedRole === "producer" ? "text-white" : "text-white"}`} />
                </div>
                <h3 className="text-xl font-cyber font-bold text-white mb-2">PRODUCER</h3>
                <p className="text-sm text-gray-400">
                  Beat makers and sound designers
                </p>
                <p className="text-xs text-sv-purple mt-2 font-bold">Beat Battles</p>
                {selectedRole === "producer" && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-sv-purple rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </motion.button>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-lg font-cyber font-bold text-lg border-2 border-sv-gray text-gray-400 hover:border-sv-pink hover:text-sv-pink transition-all"
                data-testid="button-back-to-name"
              >
                BACK
              </motion.button>
              <motion.button
                whileHover={{ scale: selectedRole ? 1.02 : 1 }}
                whileTap={{ scale: selectedRole ? 0.98 : 1 }}
                onClick={handleSubmit}
                disabled={!selectedRole || isSubmitting}
                className={`flex-1 py-4 rounded-lg font-cyber font-bold text-lg transition-all ${
                  selectedRole
                    ? "bg-gradient-to-r from-sv-pink to-sv-purple text-white cursor-pointer hover:opacity-90"
                    : "bg-sv-gray text-gray-500 cursor-not-allowed"
                }`}
                data-testid="button-confirm-class"
              >
                {isSubmitting ? "Setting up..." : "ENTER THE ARENA"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
