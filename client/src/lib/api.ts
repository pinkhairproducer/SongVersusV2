import type { User, Battle, Comment, ChatMessage } from "@shared/schema";

export async function fetchLeaderboard(): Promise<User[]> {
  const response = await fetch("/api/leaderboard");
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
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
  leftArtist: string;
  leftTrack: string;
  leftCover: string;
  leftUserId: number | null;
  endsAt: Date;
}): Promise<Battle> {
  const response = await fetch("/api/battles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create battle");
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
