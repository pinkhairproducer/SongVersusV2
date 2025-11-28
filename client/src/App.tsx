import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Battles from "@/pages/Battles";
import BattleDetail from "@/pages/BattleDetail";
import Artists from "@/pages/Artists";
import Producers from "@/pages/Producers";
import Store from "@/pages/Store";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Notifications from "@/pages/Notifications";
import Inbox from "@/pages/Inbox";
import Settings from "@/pages/Settings";
import MyBattles from "@/pages/MyBattles";
import Customizations from "@/pages/Customizations";
import { SplashScreen } from "@/components/SplashScreen";
import { Tutorial } from "@/components/Tutorial";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/battles" component={Battles} />
      <Route path="/battle/:id" component={BattleDetail} />
      <Route path="/artists" component={Artists} />
      <Route path="/producers" component={Producers} />
      <Route path="/store" component={Store} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/user/:id" component={UserProfile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/settings" component={Settings} />
      <Route path="/my-battles" component={MyBattles} />
      <Route path="/customizations" component={Customizations} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { GlobalChat } from "@/components/chat/GlobalChat";
import { SlotMachine } from "@/components/games/SlotMachine";
import { UserProvider, useUser } from "@/context/UserContext";

function AppContent() {
  const { user, refreshUser } = useUser();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splash_seen");
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [showClassSelection, setShowClassSelection] = useState(false);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_seen", "true");
    setShowSplash(false);
    
    if (user && !user.roleSelected) {
      setShowClassSelection(true);
    } else if (user && !user.tutorialCompleted) {
      setShowTutorial(true);
    }
  };

  const handleClassSelectionComplete = async () => {
    setShowClassSelection(false);
    await refreshUser();
    if (user && !user.tutorialCompleted) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    if (user) {
      try {
        await fetch("/api/tutorial/complete", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to mark tutorial complete:", error);
      }
    }
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
  };

  useEffect(() => {
    if (user && !showSplash && !showClassSelection) {
      if (!user.roleSelected) {
        setShowClassSelection(true);
      } else if (!user.tutorialCompleted) {
        const tutorialSeen = sessionStorage.getItem("tutorial_seen");
        if (!tutorialSeen) {
          setShowTutorial(true);
        }
      }
    }
  }, [user, showSplash, showClassSelection]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {showClassSelection && user && (
        <ClassSelectionDialog userId={user.id} onComplete={handleClassSelectionComplete} />
      )}
      {showTutorial && (
        <Tutorial onComplete={handleTutorialComplete} onSkip={handleTutorialSkip} />
      )}
      <Toaster />
      <Router />
      <GlobalChat />
      <SlotMachine />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
