import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { AlertCircle, LogOut, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout, refreshUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to login to access settings</p>
            <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-white/90">
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get upload URL");
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleUploadComplete = async (uploadUrl: string) => {
    try {
      const response = await fetch("/api/profile-image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageURL: uploadUrl }),
      });
      
      if (!response.ok) throw new Error("Failed to update profile");
      
      await refreshUser();
      toast({
        title: "Profile picture updated!",
        description: "Your new profile picture is now visible.",
      });
    } catch (error) {
      console.error("Failed to update profile image:", error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

            {/* Profile Picture Section */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-sv-pink">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-sv-gray">
                    {(user.name || "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <ObjectUploader
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    maxFileSize={5242880}
                    allowedFileTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                    buttonClassName="bg-sv-pink hover:bg-sv-pink/80 text-black font-bold"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </ObjectUploader>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">Account</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Username</p>
                    <p className="text-muted-foreground text-sm">{user.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Role</p>
                    <p className="text-muted-foreground text-sm capitalize">
                      {user.role === "producer" ? "Producer" : "Artist"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-card/50 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white">Enable notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white">Email updates</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
                  <p className="text-muted-foreground text-sm">Irreversible actions</p>
                </div>
              </div>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
