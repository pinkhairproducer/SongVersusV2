import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Coins, Lock, Check, Sparkles, Palette, Zap, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customization } from "@shared/schema";

async function fetchCustomizations(): Promise<Customization[]> {
  const response = await fetch("/api/customizations");
  if (!response.ok) throw new Error("Failed to fetch customizations");
  return response.json();
}

async function fetchUserCustomizations(userId: number): Promise<{ customizationId: number }[]> {
  const response = await fetch(`/api/customizations/user/${userId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch user customizations");
  return response.json();
}

async function unlockCustomization(customizationId: number): Promise<any> {
  const response = await fetch("/api/customizations/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ customizationId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unlock");
  }
  return response.json();
}

async function equipCustomization(category: string, customizationId: number): Promise<any> {
  const response = await fetch("/api/customizations/equip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ category, customizationId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to equip");
  }
  return response.json();
}

function CustomizationCard({
  customization,
  isOwned,
  isEquipped,
  userLevel,
  userCoins,
  onUnlock,
  onEquip,
}: {
  customization: Customization;
  isOwned: boolean;
  isEquipped: boolean;
  userLevel: number;
  userCoins: number;
  onUnlock: () => void;
  onEquip: () => void;
}) {
  const canUnlock = customization.unlockType === "level"
    ? userLevel >= (customization.requiredLevel || 1)
    : userCoins >= (customization.coinCost || 0);

  const isDefault = customization.isDefault;
  const available = isDefault || isOwned;

  const getRarityBorder = () => {
    switch (customization.rarity) {
      case "legendary": return "border-sv-gold";
      case "epic": return "border-sv-purple";
      case "rare": return "border-blue-500";
      default: return "border-sv-gray";
    }
  };

  const getRarityGlow = () => {
    switch (customization.rarity) {
      case "legendary": return "shadow-sv-gold/30";
      case "epic": return "shadow-sv-purple/30";
      case "rare": return "shadow-blue-500/30";
      default: return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-sv-dark border-2 rounded-lg p-4 transition-all",
        getRarityBorder(),
        isEquipped && "ring-2 ring-sv-pink",
        getRarityGlow() && `shadow-lg ${getRarityGlow()}`
      )}
      data-testid={`customization-${customization.id}`}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-sv-pink rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-black" />
        </div>
      )}

      <div className="mb-4 h-24 flex items-center justify-center bg-sv-black/50 rounded border border-sv-gray/30">
        {customization.category === "plate" && (
          <div className="w-16 h-16 rounded border-2 border-dashed" style={{ borderColor: customization.cssClass || "#A64BFF" }}>
            <Palette className="w-full h-full p-3 text-gray-500" />
          </div>
        )}
        {customization.category === "animation" && (
          <Sparkles className="w-12 h-12 text-sv-gold animate-pulse" />
        )}
        {customization.category === "sphere" && (
          <Circle className="w-12 h-12" style={{ fill: customization.cssClass || "#FF2EC3", stroke: "none" }} />
        )}
      </div>

      <h3 className="font-cyber text-white text-sm mb-1">{customization.name}</h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{customization.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded capitalize",
          customization.rarity === "legendary" && "bg-sv-gold/20 text-sv-gold",
          customization.rarity === "epic" && "bg-sv-purple/20 text-sv-purple",
          customization.rarity === "rare" && "bg-blue-500/20 text-blue-400",
          customization.rarity === "common" && "bg-gray-500/20 text-gray-400"
        )}>
          {customization.rarity}
        </span>
        
        {!isDefault && !isOwned && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {customization.unlockType === "level" ? (
              <>
                <Zap className="w-3 h-3" />
                LVL {customization.requiredLevel}
              </>
            ) : (
              <>
                <Coins className="w-3 h-3 text-sv-gold" />
                {customization.coinCost}
              </>
            )}
          </span>
        )}
      </div>

      {available ? (
        <Button
          size="sm"
          className={cn(
            "w-full",
            isEquipped
              ? "bg-sv-gray text-white"
              : "bg-sv-pink text-black hover:bg-sv-pink/80"
          )}
          onClick={onEquip}
          disabled={isEquipped}
          data-testid={`equip-${customization.id}`}
        >
          {isEquipped ? "Equipped" : "Equip"}
        </Button>
      ) : (
        <Button
          size="sm"
          className={cn(
            "w-full",
            canUnlock
              ? "bg-sv-purple text-white hover:bg-sv-purple/80"
              : "bg-sv-gray/50 text-gray-500 cursor-not-allowed"
          )}
          onClick={onUnlock}
          disabled={!canUnlock}
          data-testid={`unlock-${customization.id}`}
        >
          <Lock className="w-3 h-3 mr-1" />
          {canUnlock ? "Unlock" : "Locked"}
        </Button>
      )}
    </motion.div>
  );
}

export default function Customizations() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customizations = [] } = useQuery({
    queryKey: ["customizations"],
    queryFn: fetchCustomizations,
  });

  const { data: userCustomizations = [] } = useQuery({
    queryKey: ["userCustomizations", user?.id],
    queryFn: () => user ? fetchUserCustomizations(user.id) : [],
    enabled: !!user,
  });

  const unlockMutation = useMutation({
    mutationFn: unlockCustomization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCustomizations"] });
      refreshUser();
      toast({
        title: "Unlocked!",
        description: "You've unlocked a new customization!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const equipMutation = useMutation({
    mutationFn: ({ category, customizationId }: { category: string; customizationId: number }) =>
      equipCustomization(category, customizationId),
    onSuccess: () => {
      refreshUser();
      toast({
        title: "Equipped!",
        description: "Your customization has been equipped!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to equip",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const ownedIds = new Set(userCustomizations.map(uc => uc.customizationId));

  const plates = customizations.filter(c => c.category === "plate");
  const animations = customizations.filter(c => c.category === "animation");
  const spheres = customizations.filter(c => c.category === "sphere");

  const getEquippedId = (category: string) => {
    if (!user) return null;
    if (category === "plate") return user.equippedPlate;
    if (category === "animation") return user.equippedAnimation;
    if (category === "sphere") return user.equippedSphere;
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-cyber font-black text-white mb-4">
              <span className="text-sv-pink">CUSTOM</span>IZATIONS
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Unlock and equip unique battle plates, animations, and sphere styles. 
              Stand out in the arena!
            </p>
            
            {user && (
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-sv-dark border border-sv-gray rounded">
                  <Coins className="w-5 h-5 text-sv-gold" />
                  <span className="font-mono text-white">{user.coins}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-sv-dark border border-sv-gray rounded">
                  <Zap className="w-5 h-5 text-sv-purple" />
                  <span className="font-mono text-white">Level {user.level || 1}</span>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="plates" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8 bg-sv-dark">
              <TabsTrigger value="plates" className="data-[state=active]:bg-sv-pink data-[state=active]:text-black">
                <Palette className="w-4 h-4 mr-2" />
                Plates
              </TabsTrigger>
              <TabsTrigger value="animations" className="data-[state=active]:bg-sv-pink data-[state=active]:text-black">
                <Sparkles className="w-4 h-4 mr-2" />
                Animations
              </TabsTrigger>
              <TabsTrigger value="spheres" className="data-[state=active]:bg-sv-pink data-[state=active]:text-black">
                <Circle className="w-4 h-4 mr-2" />
                Spheres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plates">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {plates.map((c) => (
                  <CustomizationCard
                    key={c.id}
                    customization={c}
                    isOwned={c.isDefault || ownedIds.has(c.id)}
                    isEquipped={getEquippedId("plate") === c.id}
                    userLevel={user?.level || 1}
                    userCoins={user?.coins || 0}
                    onUnlock={() => unlockMutation.mutate(c.id)}
                    onEquip={() => equipMutation.mutate({ category: "plate", customizationId: c.id })}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="animations">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {animations.map((c) => (
                  <CustomizationCard
                    key={c.id}
                    customization={c}
                    isOwned={c.isDefault || ownedIds.has(c.id)}
                    isEquipped={getEquippedId("animation") === c.id}
                    userLevel={user?.level || 1}
                    userCoins={user?.coins || 0}
                    onUnlock={() => unlockMutation.mutate(c.id)}
                    onEquip={() => equipMutation.mutate({ category: "animation", customizationId: c.id })}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="spheres">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {spheres.map((c) => (
                  <CustomizationCard
                    key={c.id}
                    customization={c}
                    isOwned={c.isDefault || ownedIds.has(c.id)}
                    isEquipped={getEquippedId("sphere") === c.id}
                    userLevel={user?.level || 1}
                    userCoins={user?.coins || 0}
                    onUnlock={() => unlockMutation.mutate(c.id)}
                    onEquip={() => equipMutation.mutate({ category: "sphere", customizationId: c.id })}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
