import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Upload, Menu, X, ShoppingBag, Coins, LogOut } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, login, logout } = useUser();

  const isActive = (path: string) => location === path;

  const displayName = user?.name || user?.firstName || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profileImageUrl || 'https://github.com/shadcn.png';

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
            
            {/* User Coins Display */}
            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mr-2">
                <Coins className="w-3.5 h-3.5" />
                <span>{user.coins.toLocaleString()}</span>
              </div>
            )}

            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
            
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : !user ? (
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-white hover:bg-white/5"
                onClick={login}
                data-testid="button-login"
              >
                Sign In
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/95 border-white/10 text-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role === 'producer' ? 'Producer' : 'Artist'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <Link href="/profile">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-battles">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                      My Battles
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer text-red-400" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
              {user && (
                 <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                       <p className="font-bold text-white">{displayName}</p>
                       <p className="text-xs text-yellow-400 flex items-center gap-1">
                         <Coins className="w-3 h-3" /> {user.coins.toLocaleString()}
                       </p>
                    </div>
                 </div>
              )}
              <Link href="/battles" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Battles</Link>
              <Link href="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Leaderboard</Link>
              <Link href="/artists" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Artists</Link>
              <Link href="/producers" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white">Producers</Link>
              <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Store</Link>
              
              {user && (
                <>
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white block py-1">Profile</Link>
                    <Link href="/my-battles" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white block py-1">My Battles</Link>
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-white block py-1">Settings</Link>
                  </div>
                </>
              )}
              
              {!user ? (
                 <Button 
                   className="w-full bg-white text-black hover:bg-white/90 font-bold justify-center" 
                   onClick={() => { setIsMobileMenuOpen(false); login(); }}
                   data-testid="button-mobile-login"
                 >
                   Sign In
                 </Button>
              ) : (
                 <Button variant="destructive" className="w-full justify-center" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                   Log Out
                 </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
