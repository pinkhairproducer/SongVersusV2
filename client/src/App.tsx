import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Bell, Lock, Palette, HelpCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [theme, setTheme] = useState("dark");

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please log in to access settings</h2>
            <Link href="/">
              <Button className="bg-violet-500 hover:bg-violet-600">Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "See you next time!",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <div className="mb-10">
            <h1 className="text-4xl font-bold font-heading text-white mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and account</p>
          </div>

          <div className="space-y-6">
            
            {/* Account Settings */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-400" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-white mb-2">Username</p>
                  <p className="text-muted-foreground font-mono">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-2">Account Type</p>
                  <p className="text-muted-foreground capitalize">{user.role === "producer" ? "🎛️ Producer" : "🎤 Artist"}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-white/10 w-full hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 mt-4"
                  onClick={handleLogout}
                  data-testid="button-logout-settings"
                >
                  Log Out
                </Button>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-fuchsia-400" />
                Display Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-white mb-3">Theme</p>
                  <div className="flex gap-3">
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"}
                      className={theme === "dark" ? "bg-violet-500 hover:bg-violet-600" : "border-white/10"}
                      onClick={() => handleThemeChange("dark")}
                      data-testid="button-theme-dark"
                    >
                      Dark Mode
                    </Button>
                    <Button 
                      variant={theme === "light" ? "default" : "outline"}
                      className={theme === "light" ? "bg-violet-500 hover:bg-violet-600" : "border-white/10"}
                      onClick={() => handleThemeChange("light")}
                      data-testid="button-theme-light"
                    >
                      Light Mode
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Notifications
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-battle-notifications" />
                  <span className="text-white">Battle Updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-chat-notifications" />
                  <span className="text-white">Chat Messages</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-leaderboard-notifications" />
                  <span className="text-white">Leaderboard Changes</span>
                </label>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Help & Support
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="border-white/10 w-full justify-start" data-testid="button-help-faq">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  FAQ
                </Button>
                <Button variant="outline" className="border-white/10 w-full justify-start" data-testid="button-help-contact">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="border-white/10 w-full justify-start" data-testid="button-help-docs">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </div>

            {/* About */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center">
              <p className="text-muted-foreground text-sm">
                SongVersus v1.0 • A competitive music battle platform
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                © 2025 SongVersus. All rights reserved.
              </p>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
