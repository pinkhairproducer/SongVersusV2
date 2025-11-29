import type { User, Battle, Comment, ChatMessage } from "@shared/schema";

export async function fetchLeaderboard(): Promise<User[]> {
  const response = await fetch("/api/leaderboard");
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

export async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function fetchBattles(): Promise<Battle[]> {
  const response = await fetch("/api/battles");
  if (!response.ok) throw new Error("Failed to fetch battles");
  return response.json();
}

export async function fetchBattle(id: number): Promise<Battle> {
  const response = await fetch(`/api/battles/${id}`);
  if (!response.ok) throw new Error("Failed to fetch battle");
  return response.json();
}

export async function createBattle(data: {
  type: string;
  genre: string;
  leftArtist: string;
  leftTrack: string;
  leftAudio: string;
  leftUserId: number | null;
  endsAt: Date;
}): Promise<Battle> {
  const response = await fetch("/api/battles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...data,
      endsAt: data.endsAt.toISOString(),
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create battle");
  }
  return response.json();
}

export async function joinBattle(battleId: number, artist: string, track: string, audio: string): Promise<Battle> {
  const response = await fetch(`/api/battles/${battleId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ artist, track, audio }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join battle");
  }
  return response.json();
}

export async function voteOnBattle(battleId: number, userId: number, side: "left" | "right"): Promise<void> {
  const response = await fetch("/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battleId, userId, side }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to vote");
  }
}

export async function fetchUserVote(battleId: number, userId: number): Promise<{ side: string } | null> {
  const response = await fetch(`/api/votes/${battleId}/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch vote");
  return response.json();
}

export async function fetchComments(battleId: number): Promise<Array<Comment & { userName: string; userAvatar: string }>> {
  const response = await fetch(`/api/comments/${battleId}`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export async function postComment(battleId: number, userId: number, text: string): Promise<Comment> {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battleId, userId, text }),
  });
  if (!response.ok) throw new Error("Failed to post comment");
  return response.json();
}

export async function fetchChatMessages(): Promise<Array<ChatMessage & { userName: string; userAvatar: string }>> {
  const response = await fetch("/api/chat");
  if (!response.ok) throw new Error("Failed to fetch chat messages");
  return response.json();
}

export async function sendChatMessage(userId: number, text: string): Promise<ChatMessage> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

export async function followUser(followerId: number, followingId: number): Promise<void> {
  const response = await fetch(`/api/users/${followingId}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId }),
  });
  if (!response.ok) throw new Error("Failed to follow user");
}

export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  const response = await fetch(`/api/users/${followingId}/unfollow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId }),
  });
  if (!response.ok) throw new Error("Failed to unfollow user");
}

export async function getFollowers(userId: number): Promise<User[]> {
  const response = await fetch(`/api/users/${userId}/followers`);
  if (!response.ok) throw new Error("Failed to fetch followers");
  return response.json();
}

export async function getFollowing(userId: number): Promise<User[]> {
  const response = await fetch(`/api/users/${userId}/following`);
  if (!response.ok) throw new Error("Failed to fetch following");
  return response.json();
}

export async function getNotifications(userId: number): Promise<any[]> {
  const response = await fetch(`/api/notifications/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const response = await fetch(`/api/notifications/${userId}/read-all`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
}

export async function updateUserProfile(userId: number, avatar: string, bio: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar, bio }),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  active: boolean;
  prices: StripePrice[];
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  active: boolean;
  metadata: Record<string, string>;
}

export async function fetchStripeProducts(): Promise<StripeProduct[]> {
  const response = await fetch("/api/stripe/products");
  if (!response.ok) throw new Error("Failed to fetch products");
  const data = await response.json();
  return data.data;
}

export async function createCheckoutSession(priceId: string, userId: number, mode: 'subscription' | 'payment'): Promise<{ url: string }> {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId, mode }),
  });
  if (!response.ok) throw new Error("Failed to create checkout session");
  return response.json();
}

export async function verifyPurchase(sessionId: string, userId: number): Promise<{
  success: boolean;
  type: string;
  amount?: number;
  newBalance?: number;
  tier?: string;
  bonusCoins?: number;
}> {
  const response = await fetch("/api/stripe/verify-purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, userId }),
  });
  if (!response.ok) throw new Error("Failed to verify purchase");
  return response.json();
}

export async function fetchUserSubscription(userId: number): Promise<{ subscription: any; membership: string }> {
  const response = await fetch(`/api/stripe/subscription/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch subscription");
  return response.json();
}

export async function createPortalSession(userId: number): Promise<{ url: string }> {
  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error("Failed to create portal session");
  return response.json();
}
