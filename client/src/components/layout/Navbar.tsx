import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Menu, X, ShoppingBag, Coins, LogOut, Zap, Mail, UserPlus, Trophy, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  userId: number;
  fromUserId: number | null;
  type: string;
  battleId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
  fromUserName?: string | null;
  fromUserAvatar?: string | null;
}

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, login, logout } = useUser();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/notifications/${user.id}`);
      return res.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["notificationCount", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const res = await fetch(`/api/notifications/${user.id}/count`);
      const data = await res.json();
      return data.count;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await fetch(`/api/notifications/${user.id}/read-all`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow": return <UserPlus className="w-4 h-4 text-sv-purple" />;
      case "message": return <Mail className="w-4 h-4 text-sv-pink" />;
      case "vote": return <Trophy className="w-4 h-4 text-sv-gold" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const isActive = (path: string) => location === path;

  const displayName = user?.name || user?.firstName || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profileImageUrl || 'https://github.com/shadcn.png';

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-sv-gray bg-sv-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sv-pink skew-x-[-12deg] flex items-center justify-center border-2 border-white sketch-border">
              <span className="font-punk text-black text-xl font-bold -skew-x-[12deg]">S</span>
            </div>
            <span className="font-cyber font-bold text-xl tracking-wider text-white hidden sm:block">
              SONG<span className="text-sv-pink">VERSUS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/battles">
              <span className={`font-hud font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer ${isActive('/battles') ? 'text-sv-pink' : 'text-gray-400 hover:text-sv-pink'}`}>
                Battles
              </span>
            </Link>
            <Link href="/leaderboard">
              <span className={`font-hud font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer ${isActive('/leaderboard') ? 'text-sv-pink' : 'text-gray-400 hover:text-sv-pink'}`}>
                Leaderboard
              </span>
            </Link>
            <Link href="/artists">
              <span className={`font-hud font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer ${isActive('/artists') ? 'text-sv-pink' : 'text-gray-400 hover:text-sv-pink'}`}>
                Artists
              </span>
            </Link>
            <Link href="/producers">
              <span className={`font-hud font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer ${isActive('/producers') ? 'text-sv-pink' : 'text-gray-400 hover:text-sv-pink'}`}>
                Producers
              </span>
            </Link>
             <Link href="/store">
              <span className={`font-hud font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer flex items-center gap-1 ${isActive('/store') ? 'text-sv-gold' : 'text-gray-400 hover:text-sv-gold'}`}>
                <ShoppingBag className="w-4 h-4" /> Store
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* User Coins Display */}
            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-sv-gold/10 border border-sv-gold/30 text-sv-gold text-xs font-cyber font-bold mr-2 skew-x-[-6deg]">
                <Coins className="w-3.5 h-3.5 skew-x-[6deg]" />
                <span className="skew-x-[6deg]">{user.coins.toLocaleString()}</span>
              </div>
            )}

            {/* Inbox Button */}
            {user && (
              <Link href="/inbox">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-sv-pink hidden sm:flex relative" data-testid="button-inbox">
                  <Mail className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Notifications Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-sv-pink hidden sm:flex relative" data-testid="button-notifications">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-sv-pink text-black text-xs font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-sv-dark border-sv-gray rounded-none" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-cyber text-white uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        className="text-xs text-sv-pink hover:text-white font-hud uppercase tracking-wider"
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        Mark all read
                      </button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-sv-gray" />
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 font-body">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b border-sv-gray/50 hover:bg-sv-purple/10 transition-colors ${!notification.read ? 'bg-sv-purple/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-body leading-tight">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 font-hud">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-sv-pink mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-sv-gray" />
                      <Link href="/inbox">
                        <DropdownMenuItem className="justify-center text-sv-pink hover:text-white font-hud uppercase tracking-wider text-sm cursor-pointer rounded-none">
                          View All
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-sv-pink hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <div className="h-6 w-px bg-sv-gray mx-1 hidden sm:block" />
            
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-sv-gray animate-pulse" />
            ) : !user ? (
              <button 
                className="cyber-btn bg-sv-pink text-black font-cyber font-bold py-2 px-6 uppercase tracking-wider text-sm hover:bg-white"
                onClick={login}
                data-testid="button-login"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-black" />
                  Enter
                </span>
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-none border border-sv-purple/50 p-0 hover:glow-purple" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8 rounded-none">
                      <AvatarImage src={avatarUrl} alt={displayName} className="rounded-none" />
                      <AvatarFallback className="rounded-none bg-sv-purple text-white font-punk">{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-sv-dark border-sv-gray text-sv-offwhite rounded-none" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-cyber font-medium leading-none text-white">{displayName}</p>
                      <p className="text-xs leading-none text-sv-purple font-hud uppercase tracking-widest">
                        {user.role === 'producer' ? 'Producer' : 'Artist'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-sv-gray" />
                  <Link href="/profile">
                    <DropdownMenuItem className="focus:bg-sv-purple/20 focus:text-white cursor-pointer font-hud uppercase tracking-wider text-sm rounded-none">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-battles">
                    <DropdownMenuItem className="focus:bg-sv-purple/20 focus:text-white cursor-pointer font-hud uppercase tracking-wider text-sm rounded-none">
                      My Battles
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="focus:bg-sv-purple/20 focus:text-white cursor-pointer font-hud uppercase tracking-wider text-sm rounded-none">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-sv-gray" />
                  <DropdownMenuItem className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-400 font-hud uppercase tracking-wider text-sm rounded-none" onClick={logout}>
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
              className="md:hidden text-gray-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-sv-gray bg-sv-black/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              {user && (
                 <div className="flex items-center gap-3 pb-4 border-b border-sv-gray">
                    <Avatar className="h-10 w-10 rounded-none border border-sv-purple">
                      <AvatarImage src={avatarUrl} className="rounded-none" />
                      <AvatarFallback className="rounded-none bg-sv-purple font-punk">{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                       <p className="font-cyber font-bold text-white">{displayName}</p>
                       <p className="text-xs text-sv-gold flex items-center gap-1 font-hud">
                         <Coins className="w-3 h-3" /> {user.coins.toLocaleString()}
                       </p>
                    </div>
                 </div>
              )}
              <Link href="/battles" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink">Battles</Link>
              <Link href="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink">Leaderboard</Link>
              <Link href="/artists" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink">Artists</Link>
              <Link href="/producers" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink">Producers</Link>
              <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-sv-gold hover:text-sv-gold/80 flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Store</Link>
              
              {user && (
                <>
                  <div className="border-t border-sv-gray pt-4 mt-2">
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink block py-1">Profile</Link>
                    <Link href="/my-battles" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink block py-1">My Battles</Link>
                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="font-hud font-bold uppercase tracking-widest text-gray-400 hover:text-sv-pink block py-1">Settings</Link>
                  </div>
                </>
              )}
              
              {!user ? (
                 <button 
                   className="cyber-btn w-full bg-sv-pink text-black font-cyber font-bold py-3 uppercase tracking-wider" 
                   onClick={() => { setIsMobileMenuOpen(false); login(); }}
                   data-testid="button-mobile-login"
                 >
                   <span className="flex items-center justify-center gap-2">
                     <Zap className="w-4 h-4 fill-black" />
                     Enter Arena
                   </span>
                 </button>
              ) : (
                 <button 
                   className="w-full border-2 border-red-500 text-red-400 font-hud font-bold py-2 uppercase tracking-widest hover:bg-red-500/10" 
                   onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                 >
                   Log Out
                 </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
