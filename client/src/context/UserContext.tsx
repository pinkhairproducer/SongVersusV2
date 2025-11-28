import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  replitAuthId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  name: string | null;
  role: string | null;
  coins: number;
  xp: number;
  wins: number;
  level: number;
  bio: string | null;
  membership: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  tutorialCompleted: boolean;
  equippedPlate?: number | null;
  equippedAnimation?: number | null;
  equippedSphere?: number | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  refreshUser: () => Promise<void>;
  setUserData: (data: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authUser) {
      setUser(authUser as User);
    } else if (!isLoading) {
      setUser(null);
    }
  }, [authUser, isLoading]);

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

  const login = () => {
    window.location.href = "/api/login";
  };

  const logout = () => {
    window.location.href = "/api/logout";
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

    fetch(`/api/users/${user.id}/coins`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coins: newCoins }),
    }).catch((error) => console.error("Failed to update coins on server:", error));
  };

  const setUserData = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated, 
      login, 
      logout, 
      spendCoins, 
      addCoins, 
      refreshUser,
      setUserData
    }}>
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
