import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Coins, Lock, Check, Sparkles, Palette, Zap, Circle, Frame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
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

async function purchaseCustomization(customizationId: number): Promise<any> {
  const response = await fetch(`/api/customizations/${customizationId}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to purchase");
  }
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
  onPurchase,
  onEquip,
  isPurchasing,
}: {
  customization: Customization;
  isOwned: boolean;
  isEquipped: boolean;
  userLevel: number;
  userCoins: number;
  onPurchase: () => void;
  onEquip: () => void;
  isPurchasing: boolean;
}) {
  const canAfford = userCoins >= (customization.coinCost || 0);
  const meetsLevel = userLevel >= (customization.requiredLevel || 1);
  const canPurchase = canAfford && meetsLevel;

  const isDefault = customization.isDefault;
  const available = isDefault || isOwned;

  const getRarityBorder = () => {
    switch (customization.rarity) {
      case "legendary": return "border-yellow-500";
      case "epic": return "border-violet-500";
      case "rare": return "border-blue-500";
      default: return "border-white/10";
    }
  };

  const getRarityGlow = () => {
    switch (customization.rarity) {
      case "legendary": return "shadow-yellow-500/30";
      case "epic": return "shadow-violet-500/30";
      case "rare": return "shadow-blue-500/30";
      default: return "";
    }
  };

  const getCategoryIcon = () => {
    switch (customization.category) {
      case "plate": return <Frame className="w-10 h-10 text-cyan-400" />;
      case "animation": return <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />;
      case "sphere": return <Circle className="w-10 h-10" style={{ fill: customization.cssClass || "#FF2EC3", stroke: "none" }} />;
      case "theme": return <Palette className="w-10 h-10 text-yellow-400" />;
      default: return <Palette className="w-10 h-10 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-card/50 backdrop-blur-sm border-2 rounded-xl p-4 transition-all hover:scale-[1.02]",
        getRarityBorder(),
        isEquipped && "ring-2 ring-fuchsia-500",
        getRarityGlow() && `shadow-lg ${getRarityGlow()}`
      )}
      data-testid={`customization-${customization.id}`}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-fuchsia-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {isOwned && !isEquipped && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-bold">
          OWNED
        </div>
      )}

      <div className="mb-4 h-24 flex items-center justify-center bg-black/30 rounded-lg border border-white/5">
        {getCategoryIcon()}
      </div>

      <h3 className="font-bold text-white text-sm mb-1">{customization.name}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{customization.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded capitalize font-medium",
          customization.rarity === "legendary" && "bg-yellow-500/20 text-yellow-400",
          customization.rarity === "epic" && "bg-violet-500/20 text-violet-400",
          customization.rarity === "rare" && "bg-blue-500/20 text-blue-400",
          customization.rarity === "common" && "bg-gray-500/20 text-gray-400"
        )}>
          {customization.rarity}
        </span>
        
        {!isDefault && !isOwned && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {customization.requiredLevel && customization.requiredLevel > 1 && (
              <span className={cn("flex items-center gap-0.5", !meetsLevel && "text-red-400")}>
                <Zap className="w-3 h-3" />
                LVL {customization.requiredLevel}
              </span>
            )}
          </span>
        )}
      </div>

      {available ? (
        <Button
          size="sm"
          className={cn(
            "w-full font-bold",
            isEquipped
              ? "bg-muted text-muted-foreground"
              : "bg-fuchsia-500 text-white hover:bg-fuchsia-600"
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
            "w-full font-bold",
            canPurchase
              ? "bg-violet-500 text-white hover:bg-violet-600"
              : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          )}
          onClick={onPurchase}
          disabled={!canPurchase || isPurchasing}
          data-testid={`purchase-${customization.id}`}
        >
          {isPurchasing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Coins className="w-3 h-3 mr-1 text-yellow-400" />
              {customization.coinCost || 0} Coins
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}

export default function Customizations() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customizations = [], isLoading } = useQuery({
    queryKey: ["customizations"],
    queryFn: fetchCustomizations,
  });

  const { data: userCustomizations = [] } = useQuery({
    queryKey: ["userCustomizations", user?.id],
    queryFn: () => user ? fetchUserCustomizations(user.id) : [],
    enabled: !!user,
  });

  const purchaseMutation = useMutation({
    mutationFn: purchaseCustomization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userCustomizations"] });
      refreshUser();
      toast({
        title: "Purchase Complete!",
        description: `You've purchased a new customization! New balance: ${data.newBalance} coins`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
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

  const ownedIds = new Set(userCustomizations.map((uc: any) => uc.id || uc.customizationId));

  const plates = customizations.filter(c => c.category === "plate");
  const animations = customizations.filter(c => c.category === "animation");
  const spheres = customizations.filter(c => c.category === "sphere");
  const themes = customizations.filter(c => c.category === "theme");

  const getEquippedId = (category: string) => {
    if (!user) return null;
    if (category === "plate") return user.equippedPlateId;
    if (category === "animation") return user.equippedAnimationId;
    if (category === "sphere") return user.equippedSphereId;
    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access customizations.</p>
            <Link href="/">
              <Button className="bg-fuchsia-500 hover:bg-fuchsia-600">Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              <span className="text-fuchsia-500">CUSTOM</span>IZATIONS
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purchase and equip unique profile plates, battle effects, and sphere skins. 
              Stand out in the arena!
            </p>
            
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-yellow-500/30 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-mono font-bold text-white">{user.coins}</span>
                <span className="text-xs text-muted-foreground">coins</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-violet-500/30 rounded-lg">
                <Zap className="w-5 h-5 text-violet-400" />
                <span className="font-mono font-bold text-white">Level {user.level || 1}</span>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/store">
                <Button variant="outline" size="sm" className="border-yellow-500/30 hover:bg-yellow-500/10">
                  <Coins className="w-4 h-4 mr-2 text-yellow-400" />
                  Need more coins? Visit Store
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
            </div>
          ) : customizations.length === 0 ? (
            <div className="text-center py-20">
              <Palette className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Customizations Available</h3>
              <p className="text-muted-foreground">Check back soon for new items!</p>
            </div>
          ) : (
            <Tabs defaultValue="plates" className="w-full">
              <TabsList className="w-full max-w-lg mx-auto grid grid-cols-4 mb-8 bg-card/50">
                <TabsTrigger value="plates" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white">
                  <Frame className="w-4 h-4 mr-2" />
                  Plates
                </TabsTrigger>
                <TabsTrigger value="animations" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Effects
                </TabsTrigger>
                <TabsTrigger value="spheres" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white">
                  <Circle className="w-4 h-4 mr-2" />
                  Spheres
                </TabsTrigger>
                <TabsTrigger value="themes" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white">
                  <Palette className="w-4 h-4 mr-2" />
                  Themes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plates">
                {plates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Frame className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No profile plates available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {plates.map((c) => (
                      <CustomizationCard
                        key={c.id}
                        customization={c}
                        isOwned={c.isDefault || ownedIds.has(c.id)}
                        isEquipped={getEquippedId("plate") === c.id}
                        userLevel={user.level || 1}
                        userCoins={user.coins || 0}
                        onPurchase={() => purchaseMutation.mutate(c.id)}
                        onEquip={() => equipMutation.mutate({ category: "plate", customizationId: c.id })}
                        isPurchasing={purchaseMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="animations">
                {animations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No battle effects available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {animations.map((c) => (
                      <CustomizationCard
                        key={c.id}
                        customization={c}
                        isOwned={c.isDefault || ownedIds.has(c.id)}
                        isEquipped={getEquippedId("animation") === c.id}
                        userLevel={user.level || 1}
                        userCoins={user.coins || 0}
                        onPurchase={() => purchaseMutation.mutate(c.id)}
                        onEquip={() => equipMutation.mutate({ category: "animation", customizationId: c.id })}
                        isPurchasing={purchaseMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="spheres">
                {spheres.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sphere skins available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {spheres.map((c) => (
                      <CustomizationCard
                        key={c.id}
                        customization={c}
                        isOwned={c.isDefault || ownedIds.has(c.id)}
                        isEquipped={getEquippedId("sphere") === c.id}
                        userLevel={user.level || 1}
                        userCoins={user.coins || 0}
                        onPurchase={() => purchaseMutation.mutate(c.id)}
                        onEquip={() => equipMutation.mutate({ category: "sphere", customizationId: c.id })}
                        isPurchasing={purchaseMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="themes">
                {themes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No profile themes available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {themes.map((c) => (
                      <CustomizationCard
                        key={c.id}
                        customization={c}
                        isOwned={c.isDefault || ownedIds.has(c.id)}
                        isEquipped={false}
                        userLevel={user.level || 1}
                        userCoins={user.coins || 0}
                        onPurchase={() => purchaseMutation.mutate(c.id)}
                        onEquip={() => {}}
                        isPurchasing={purchaseMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
