import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Crown, Star, Coins } from "lucide-react";

const MEMBERSHIP_TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "For new artists just starting out.",
    features: [
      "Join 3 Battles per month",
      "Vote on active battles",
      "Basic profile",
      "Community access"
    ],
    cta: "Current Plan",
    popular: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    description: "For serious competitors climbing the ranks.",
    features: [
      "Unlimited Battles",
      "Pro Badge on profile",
      "Detailed battle analytics",
      "Priority support",
      "500 Monthly Bonus Coins"
    ],
    cta: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Elite",
    price: "$19.99",
    period: "/mo",
    description: "For the ultimate SongVersus champions.",
    features: [
      "Everything in Pro",
      "Featured Artist spot",
      "Host your own tournaments",
      "Custom profile themes",
      "1500 Monthly Bonus Coins"
    ],
    cta: "Go Elite",
    popular: false
  }
];

const COIN_PACKAGES = [
  { amount: 500, price: "$4.99", bonus: null },
  { amount: 1200, price: "$9.99", bonus: "20% Bonus" },
  { amount: 2500, price: "$19.99", bonus: "25% Bonus", popular: true },
  { amount: 6500, price: "$49.99", bonus: "30% Bonus" },
];

export default function Store() {
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
          </div>

          {/* Membership Tiers */}
          <div className="mb-24">
            <h2 className="text-2xl font-bold font-heading text-white mb-8 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Memberships
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MEMBERSHIP_TIERS.map((tier) => (
                <Card key={tier.name} className={`bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden ${tier.popular ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' : ''}`}>
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4 flex items-baseline text-white">
                      <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-violet-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className={`w-full font-bold ${tier.popular ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'bg-white text-black hover:bg-white/90'}`}>
                      {tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Coin Store */}
          <div>
            <h2 className="text-2xl font-bold font-heading text-white mb-8 flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              Coin Store
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COIN_PACKAGES.map((pkg) => (
                <Card key={pkg.amount} className={`bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden hover:border-white/20 transition-colors ${pkg.popular ? 'border-yellow-500/30' : ''}`}>
                  {pkg.bonus && (
                    <div className="absolute top-0 right-0 bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-white/5">
                      {pkg.bonus}
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                      <Coins className="w-8 h-8 text-yellow-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white">{pkg.amount}</CardTitle>
                    <CardDescription>Versus Coins</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white">
                      Buy for {pkg.price}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
