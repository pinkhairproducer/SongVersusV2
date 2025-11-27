import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Upload } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold font-heading text-xl">S</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-white">
            SongVersus
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/battles" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Battles
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/artists" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Artists
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="h-6 w-px bg-white/10 mx-1" />
          
          <Button className="bg-white text-black hover:bg-white/90 font-bold hidden sm:flex">
            <Upload className="w-4 h-4 mr-2" />
            Upload Track
          </Button>

          <Avatar className="w-8 h-8 border border-white/10">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
