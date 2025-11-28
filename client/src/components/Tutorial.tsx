import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Zap, Trophy, Users, MessageSquare, Coins, Sparkles } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right" | "center";
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to SongVersus!",
    description: "The underground arena where Artists and Producers clash in epic music battles. Let us show you around!",
    icon: <Zap className="w-8 h-8 text-sv-pink" />,
    position: "center",
  },
  {
    id: "battles",
    title: "Music Battles",
    description: "Create or join battles to compete against other musicians. Upload your tracks and let the community vote for the winner!",
    icon: <Trophy className="w-8 h-8 text-sv-gold" />,
    position: "center",
    highlight: "nav-battles",
  },
  {
    id: "coins",
    title: "Versus Coins",
    description: "Earn coins by winning battles and voting. Use them to create new battles, unlock exclusive customizations, and more!",
    icon: <Coins className="w-8 h-8 text-sv-gold" />,
    position: "center",
  },
  {
    id: "community",
    title: "Connect with Artists",
    description: "Follow other artists, chat in real-time, and build your network in the music community.",
    icon: <Users className="w-8 h-8 text-sv-purple" />,
    position: "center",
    highlight: "nav-leaderboard",
  },
  {
    id: "customizations",
    title: "Unlock Customizations",
    description: "Level up to unlock exclusive battle plates, animations, and audio-reactive sphere styles. Show off your achievements!",
    icon: <Sparkles className="w-8 h-8 text-sv-pink" />,
    position: "center",
  },
  {
    id: "ready",
    title: "You're Ready!",
    description: "Start battling, earn XP, climb the leaderboard, and become a legend. Good luck!",
    icon: <Zap className="w-8 h-8 text-sv-gold" />,
    position: "center",
  },
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  useEffect(() => {
    if (step.highlight) {
      const element = document.querySelector(`[data-testid="${step.highlight}"]`);
      if (element) {
        element.classList.add("tutorial-highlight");
        return () => element.classList.remove("tutorial-highlight");
      }
    }
  }, [step.highlight]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          data-testid="tutorial-overlay"
        >
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative bg-sv-dark border border-sv-gray rounded-lg p-8 max-w-md w-full"
          >
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              data-testid="tutorial-skip"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 rounded-full bg-sv-black border border-sv-gray flex items-center justify-center mb-6"
              >
                {step.icon}
              </motion.div>

              <h2 className="text-2xl font-cyber font-bold text-white mb-4">
                {step.title}
              </h2>

              <p className="text-gray-400 mb-8 leading-relaxed">
                {step.description}
              </p>

              <div className="flex items-center gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-sv-pink"
                        : index < currentStep
                        ? "bg-sv-purple"
                        : "bg-sv-gray"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-4 w-full">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-3 px-4 border border-sv-gray text-gray-400 rounded hover:border-sv-purple hover:text-white transition-colors flex items-center justify-center gap-2"
                    data-testid="tutorial-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-sv-pink text-black font-bold rounded hover:bg-sv-pink/80 transition-colors flex items-center justify-center gap-2"
                  data-testid="tutorial-next"
                >
                  {isLastStep ? "Start Battling!" : "Next"}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {step.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-64 h-64 border-2 border-sv-pink rounded-full animate-ping opacity-20" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
