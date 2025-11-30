import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon!",
      description: `${feature} will be available soon. Stay tuned!`,
    });
  };

  return (
    <footer className="border-t border-sv-gray bg-sv-black py-12 relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sv-pink skew-x-[-12deg] flex items-center justify-center border-2 border-white">
                <span className="font-punk text-black text-xl font-bold -skew-x-[12deg]">S</span>
              </div>
              <span className="font-cyber font-bold text-xl tracking-wider text-white">
                SONG<span className="text-sv-pink">VERSUS</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-body">
              The underground arena where Artists and Producers clash. 
              Drop tracks. Win ORBs. Become Legend.
            </p>
          </div>
          
          <div>
            <h4 className="text-sv-gold font-hud font-bold tracking-widest uppercase mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-hud">
              <li><Link href="/battles" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-battles">Active Battles</Link></li>
              <li><button onClick={() => handleComingSoon("Tournaments")} className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="button-tournaments">Tournaments</button></li>
              <li><Link href="/leaderboard" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-leaderboard">Leaderboards</Link></li>
              <li><Link href="/store" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-pricing">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sv-gold font-hud font-bold tracking-widest uppercase mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-hud">
              <li><a href="https://discord.gg/pNdgdWqW4j" target="_blank" rel="noopener noreferrer" className="hover:text-sv-pink cursor-pointer transition-colors">Discord Server</a></li>
              <li><Link href="/legal/guidelines" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-guidelines">Guidelines</Link></li>
              <li><Link href="/legal/ai" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-ai-rules">AI Rules</Link></li>
              <li><Link href="/support" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-support">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sv-gold font-hud font-bold tracking-widest uppercase mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-hud">
              <li><Link href="/legal/privacy" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-privacy">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-terms">Terms of Service</Link></li>
              <li><Link href="/legal/copyright" className="hover:text-sv-pink cursor-pointer transition-colors" data-testid="link-copyright">Copyright</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-sv-gray pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-mono">
            © 2024 SongVersus Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs font-hud text-gray-600 uppercase tracking-widest">Powered by the underground</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
