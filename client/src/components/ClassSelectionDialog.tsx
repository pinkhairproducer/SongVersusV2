import { motion } from "framer-motion";
import { Mic, Music4 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ClassSelectionDialogProps {
  userId: number;
  onComplete: () => void;
}

export function ClassSelectionDialog({ userId, onComplete }: ClassSelectionDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"artist" | "producer" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) throw new Error("Failed to set role");
      
      toast({
        title: "Class Selected!",
        description: `You are now a ${selectedRole === "artist" ? "Artist" : "Producer"}`,
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set class. Please try again.",
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
        <h2 className="text-3xl font-cyber font-black text-white mb-2">
          CHOOSE YOUR <span className="text-sv-pink">CLASS</span>
        </h2>
        <p className="text-gray-400 mb-8">
          Are you a vocalist, rapper, or songwriter? Or do you make the beats?
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
              Vocalists, rappers, and songwriters who bring the lyrics and melodies
            </p>
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
              Beat makers, composers, and sound designers who craft the instrumentals
            </p>
            {selectedRole === "producer" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-sv-purple rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: selectedRole ? 1.02 : 1 }}
          whileTap={{ scale: selectedRole ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
          className={`w-full py-4 rounded-lg font-cyber font-bold text-lg transition-all ${
            selectedRole
              ? "bg-gradient-to-r from-sv-pink to-sv-purple text-white cursor-pointer hover:opacity-90"
              : "bg-sv-gray text-gray-500 cursor-not-allowed"
          }`}
          data-testid="button-confirm-class"
        >
          {isSubmitting ? "Setting up..." : "ENTER THE ARENA"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
