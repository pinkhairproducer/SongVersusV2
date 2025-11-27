export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-linear-to-br from-violet-600 to-fuchsia-600 rounded flex items-center justify-center">
                <span className="text-white font-bold font-heading text-sm">S</span>
              </div>
              <span className="text-lg font-bold font-heading tracking-tight text-white">
                SongVersus
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The ultimate battleground for producers, rappers, and vocalists. 
              Prove your skills, win prizes, and get discovered.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">Active Battles</li>
              <li className="hover:text-primary cursor-pointer">Tournaments</li>
              <li className="hover:text-primary cursor-pointer">Leaderboards</li>
              <li className="hover:text-primary cursor-pointer">Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">Discord Server</li>
              <li className="hover:text-primary cursor-pointer">Blog</li>
              <li className="hover:text-primary cursor-pointer">Guidelines</li>
              <li className="hover:text-primary cursor-pointer">Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">Privacy Policy</li>
              <li className="hover:text-primary cursor-pointer">Terms of Service</li>
              <li className="hover:text-primary cursor-pointer">Copyright</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 text-center text-sm text-muted-foreground">
          © 2024 SongVersus Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
