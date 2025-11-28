import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Coins, Loader2, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchStripeProducts, createCheckoutSession, verifyPurchase, createPortalSession, type StripeProduct } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { SignupModal } from "@/components/auth/SignupModal";

const MEMBERSHIP_FEATURES: Record<string, string[]> = {
  free: [
    "Join 3 Battles per month",
    "Vote on active battles",
    "Basic profile",
    "Community access"
  ],
  pro: [
    "Unlimited Battles",
    "Pro Badge on profile",
    "Detailed battle analytics",
    "Priority support",
    "500 Monthly Bonus Coins"
  ],
  elite: [
    "Everything in Pro",
    "Featured Artist spot",
    "Host your own tournaments",
    "Custom profile themes",
    "1500 Monthly Bonus Coins"
  ]
};

export default function Store() {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: fetchStripeProducts,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId && user && !processingPurchase) {
      setProcessingPurchase(true);
      verifyPurchase(sessionId, user.id)
        .then((result) => {
          if (result.success) {
            if (result.type === 'coins') {
              toast({
                title: "Purchase Complete!",
                description: `You received ${result.amount} coins! New balance: ${result.newBalance}`,
              });
            } else if (result.type === 'membership') {
              toast({
                title: "Welcome to " + (result.tier === 'elite' ? 'Elite' : 'Pro') + "!",
                description: `You received ${result.bonusCoins} bonus coins with your membership.`,
              });
            }
            refreshUser();
          }
          window.history.replaceState({}, '', '/store');
        })
        .catch((err) => {
          console.error('Verify error:', err);
        })
        .finally(() => {
          setProcessingPurchase(false);
        });
    }

    if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Purchase Canceled",
        description: "Your purchase was canceled. No charges were made.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/store');
    }
  }, [user, toast, refreshUser, processingPurchase]);

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, mode }: { priceId: string; mode: 'subscription' | 'payment' }) => {
      if (!user) throw new Error("Please sign in first");
      return createCheckoutSession(priceId, user.id, mode);
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      return createPortalSession(user.id);
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      setIsSignupOpen(true);
      return;
    }
    checkoutMutation.mutate({ priceId, mode });
  };

  const membershipProducts = products?.filter(p => p.metadata.tier === 'pro' || p.metadata.tier === 'elite') || [];
  const coinProducts = products?.filter(p => p.metadata.type === 'coins') || [];

  const formatPrice = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const userMembership = user?.membership || 'free';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-4">Upgrade Your Game</h1>
            <p className="text-muted-foreground text-lg">
              Unlock unlimited battles, gain exclusive perks, and stock up on coins to boost your favorite tracks.
            </p>
            {user && userMembership !== 'free' && (
              <div className="mt-4 inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 px-4 py-2 rounded-full text-sm font-medium">
                <Crown className="w-4 h-4" />
                Current Plan: {userMembership.charAt(0).toUpperCase() + userMembership.slice(1)}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6 text-xs"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                  Manage
                </Button>
              </div>
            )}
          </div>

          {/* Membership Tiers */}
          <div className="mb-24">
            <h2 className="text-2xl font-bold font-heading text-white mb-8 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Memberships
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free tier (always shown) */}
                <Card className="bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Free</CardTitle>
                    <CardDescription>For new artists just starting out.</CardDescription>
                    <div className="mt-4 flex items-baseline text-white">
                      <span className="text-4xl font-bold tracking-tight">$0</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {MEMBERSHIP_FEATURES.free.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-violet-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full font-bold bg-white/10 text-white hover:bg-white/20"
                      disabled={userMembership === 'free'}
                    >
                      {userMembership === 'free' ? 'Current Plan' : 'Free Forever'}
                    </Button>
                  </CardFooter>
                </Card>

                {membershipProducts.map((product) => {
                  const tier = product.metadata.tier;
                  const price = product.prices[0];
                  const isPro = tier === 'pro';
                  const isCurrentPlan = userMembership === tier;
                  
                  return (
                    <Card 
                      key={product.id} 
                      className={`bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden ${isPro ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : ''}`}
                    >
                      {isPro && (
                        <div className="absolute top-0 right-0 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          MOST POPULAR
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">
                          {tier === 'pro' ? 'Pro' : 'Elite'}
                        </CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                        <div className="mt-4 flex items-baseline text-white">
                          <span className="text-4xl font-bold tracking-tight">
                            {price ? formatPrice(price.unit_amount) : '$?.??'}
                          </span>
                          <span className="text-muted-foreground ml-1">/mo</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {MEMBERSHIP_FEATURES[tier]?.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-violet-400 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full font-bold ${isPro ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'bg-white text-black hover:bg-white/90'}`}
                          onClick={() => price && handlePurchase(price.id, 'subscription')}
                          disabled={checkoutMutation.isPending || isCurrentPlan || !price}
                          data-testid={`button-upgrade-${tier}`}
                        >
                          {checkoutMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {isCurrentPlan ? 'Current Plan' : `Upgrade to ${tier === 'pro' ? 'Pro' : 'Elite'}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coin Store */}
          <div>
            <h2 className="text-2xl font-bold font-heading text-white mb-8 flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              Coin Store
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coinProducts.map((product) => {
                  const price = product.prices[0];
                  const coinAmount = product.metadata.coinAmount;
                  const bonus = product.metadata.bonus;
                  const isPopular = parseInt(coinAmount) === 2500;
                  
                  return (
                    <Card 
                      key={product.id} 
                      className={`bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden hover:border-white/20 transition-colors ${isPopular ? 'border-yellow-500/30' : ''}`}
                    >
                      {bonus && (
                        <div className="absolute top-0 right-0 bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-white/5">
                          {bonus}
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                          <Coins className="w-8 h-8 text-yellow-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-white">{coinAmount}</CardTitle>
                        <CardDescription>Versus Coins</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/10 hover:bg-white/5 hover:text-white"
                          onClick={() => price && handlePurchase(price.id, 'payment')}
                          disabled={checkoutMutation.isPending || !price}
                          data-testid={`button-buy-coins-${coinAmount}`}
                        >
                          {checkoutMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Buy for {price ? formatPrice(price.unit_amount) : '$?.??'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
      <SignupModal open={isSignupOpen} onOpenChange={setIsSignupOpen} />
    </div>
  );
}
