import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Upload, Menu, X, ShoppingBag, Coins } from "lucide-react";
import { useState } from "react";
import { SignupModal } from "@/components/auth/SignupModal";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-heading text-xl">S</span>
            </div>
            <span className="text-xl font-bold font-heading tracking-tight text-white hidden sm:block">
              SongVersus
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/battles">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isActive('/battles') ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
                Battles
              </span>
            </Link>
            <Link href="/leaderboard">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isActive('/leaderboard') ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
                Leaderboard
              </span>
            </Link>
            <Link href="/artists">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isActive('/artists') ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
                Artists
              </span>
            </Link>
            <Link href="/producers">
              <span className={`text-sm font-medium transition-colors cursor-pointer ${isActive('/producers') ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
                Producers
              </span>
            </Link>
             <Link href="/store">
              <span className={`text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 ${isActive('/store') ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}>
                <ShoppingBag className="w-4 h-4" /> Store
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* User Coins Display (Mock) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mr-2">
              <Coins className="w-3.5 h-3.5" />
              <span>1,250</span>
            </div>

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
            
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={() => setIsSignupOpen(true)}
            >
              Sign Up
            </Button>

            <Button className="bg-white text-black hover:bg-white/90 font-bold hidden sm:flex">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/battles" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Battles</Link>
              <Link href="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Leaderboard</Link>
              <Link href="/artists" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Artists</Link>
              <Link href="/producers" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Producers</Link>
              <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Store</Link>
              <div className="h-px bg-white/10 my-2" />
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold justify-center">
                Upload Track
              </Button>
            </div>
          </div>
        )}
      </nav>

      <SignupModal open={isSignupOpen} onOpenChange={setIsSignupOpen} />
    </>
  );
}
