import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  role: "producer" | "artist" | null;
  coins: number;
  avatar: string;
  isLoggedIn: boolean;
}

interface UserContextType {
  user: User | null;
  login: (role: "producer" | "artist", name: string) => void;
  logout: () => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Load user from local storage for persistence across reloads in prototype
  useEffect(() => {
    const storedUser = localStorage.getItem("mock_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("mock_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mock_user");
    }
  }, [user]);

  const login = (role: "producer" | "artist", name: string) => {
    setUser({
      name,
      role,
      coins: 1000, // Starting bonus
      avatar: "https://github.com/shadcn.png",
      isLoggedIn: true,
    });
    toast({
      title: "Welcome to SongVersus!",
      description: `You've joined as a ${role}. Here is 1,000 coins to get started!`,
    });
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const spendCoins = (amount: number): boolean => {
    if (!user) return false;
    if (user.coins < amount) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${amount} coins but only have ${user.coins}. Visit the store!`,
        variant: "destructive",
      });
      return false;
    }

    setUser({ ...user, coins: user.coins - amount });
    return true;
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, coins: user.coins + amount });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, spendCoins, addCoins }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
