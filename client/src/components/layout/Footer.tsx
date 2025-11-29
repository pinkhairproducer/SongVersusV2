import { Link } from "wouter";

export function Footer() {
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
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Active Battles</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Tournaments</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Leaderboards</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sv-gold font-hud font-bold tracking-widest uppercase mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-hud">
              <li><a href="https://discord.gg/pNdgdWqW4j" target="_blank" rel="noopener noreferrer" className="hover:text-sv-pink cursor-pointer transition-colors">Discord Server</a></li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Guidelines</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sv-gold font-hud font-bold tracking-widest uppercase mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-hud">
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-sv-pink cursor-pointer transition-colors">Copyright</li>
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
