import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  role: "producer" | "artist";
  coins: number;
  xp: number;
  wins: number;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  login: (role: "producer" | "artist", name: string, password: string) => Promise<boolean>;
  signup: (role: "producer" | "artist", name: string, password: string) => Promise<boolean>;
  logout: () => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to local storage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("current_user");
    }
  }, [user]);

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const signup = async (role: "producer" | "artist", name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Signup Failed",
          description: error.error || "Could not create account",
          variant: "destructive",
        });
        return false;
      }

      const { user: newUser } = await response.json();
      setUser(newUser);
      toast({
        title: "Welcome to SongVersus!",
        description: `You've joined as a ${role}. Here are 1,000 coins to get started!`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
      return false;
    }
  };

  const login = async (role: "producer" | "artist", name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return false;
      }

      const { user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      toast({
        title: `Welcome back, ${loggedInUser.name}!`,
        description: `You have ${loggedInUser.coins} coins`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
      return false;
    }
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

    const newCoins = user.coins - amount;
    setUser({ ...user, coins: newCoins });

    // Update on server
    fetch(`/api/users/${user.id}/coins`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins: newCoins }),
    }).catch((error) => console.error("Failed to update coins on server:", error));

    return true;
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    const newCoins = user.coins + amount;
    setUser({ ...user, coins: newCoins });

    // Update on server
    fetch(`/api/users/${user.id}/coins`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins: newCoins }),
    }).catch((error) => console.error("Failed to update coins on server:", error));
  };

  return (
    <UserContext.Provider value={{ user, login, signup, logout, spendCoins, addCoins, refreshUser }}>
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
