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
import Legal from "@/pages/Legal";
import Support from "@/pages/Support";
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
      <Route path="/legal/:type" component={Legal} />
      <Route path="/support" component={Support} />
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
  const [classSelectionDone, setClassSelectionDone] = useState(() => {
    return sessionStorage.getItem("class_selection_done") === "true";
  });
  const [tutorialDone, setTutorialDone] = useState(() => {
    return sessionStorage.getItem("tutorial_seen") === "true";
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash_seen", "true");
    setShowSplash(false);
    
    if (user && !user.roleSelected && !classSelectionDone) {
      setShowClassSelection(true);
    } else if (user && !user.tutorialCompleted && !tutorialDone) {
      setShowTutorial(true);
    }
  };

  const handleClassSelectionComplete = async () => {
    setShowClassSelection(false);
    setClassSelectionDone(true);
    sessionStorage.setItem("class_selection_done", "true");
    const updatedUser = await refreshUser();
    if (updatedUser && !updatedUser.tutorialCompleted && !tutorialDone) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    setTutorialDone(true);
    sessionStorage.setItem("tutorial_seen", "true");
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
    setTutorialDone(true);
    sessionStorage.setItem("tutorial_seen", "true");
  };

  useEffect(() => {
    if (user && !showSplash && !showClassSelection && !showTutorial) {
      if (!user.roleSelected && !classSelectionDone) {
        setShowClassSelection(true);
      } else if (!user.tutorialCompleted && !tutorialDone) {
        setShowTutorial(true);
      }
    }
  }, [user, showSplash, showClassSelection, showTutorial, classSelectionDone, tutorialDone]);

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
