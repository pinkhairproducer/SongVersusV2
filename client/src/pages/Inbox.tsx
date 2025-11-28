import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, Send, Inbox as InboxIcon, CheckCheck, UserPlus, Trophy, Bell, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  toUserName?: string;
  toUserAvatar?: string;
}

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

interface User {
  id: number;
  name: string;
  profileImageUrl?: string;
}

export default function Inbox() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-sv-black flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4 font-body">You need to login to view your inbox</p>
            <Button onClick={() => setLocation("/")} className="cyber-btn bg-sv-pink text-black font-cyber">
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", user.id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${user.id}`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: sentMessages = [], isLoading: sentLoading } = useQuery<Message[]>({
    queryKey: ["sentMessages", user.id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${user.id}/sent`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", user.id],
    queryFn: async () => {
      const res = await fetch(`/api/notifications/${user.id}`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ["userSearch", recipientSearch],
    queryFn: async () => {
      if (!recipientSearch || recipientSearch.length < 2) return [];
      const res = await fetch(`/api/leaderboard`);
      const users = await res.json();
      return users.filter((u: User) => {
        const searchName = (u.name || "").toLowerCase();
        return searchName.includes(recipientSearch.toLowerCase()) && u.id !== user.id && u.name;
      }).slice(0, 5);
    },
    enabled: recipientSearch.length >= 2,
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/notifications/${user.id}/read-all`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await fetch(`/api/messages/${messageId}/read`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { toUserId: number; subject: string; content: string }) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: user.id, ...data }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentMessages"] });
      setComposeOpen(false);
      setSelectedRecipient(null);
      setMessageSubject("");
      setMessageContent("");
      setRecipientSearch("");
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

  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSendMessage = () => {
    if (!selectedRecipient || !messageSubject.trim() || !messageContent.trim()) return;
    sendMessageMutation.mutate({
      toUserId: selectedRecipient.id,
      subject: messageSubject,
      content: messageContent,
    });
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markMessageReadMutation.mutate(message.id);
    }
  };

  if (messagesLoading || notificationsLoading) {
    return (
      <div className="min-h-screen bg-sv-black flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sv-pink" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sv-black flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-cyber text-4xl font-bold text-white tracking-wider">
                  <span className="text-sv-pink">IN</span>BOX
                </h1>
                <p className="text-gray-400 mt-2 font-hud uppercase tracking-widest text-sm">
                  Messages & Notifications
                </p>
              </div>
              
              <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                <DialogTrigger asChild>
                  <button className="cyber-btn bg-sv-pink text-black font-cyber font-bold py-2 px-6 uppercase tracking-wider text-sm hover:bg-white" data-testid="button-compose">
                    <Send className="w-4 h-4 mr-2 inline" />
                    Compose
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-sv-dark border-sv-gray rounded-none max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-cyber text-white uppercase tracking-wider">New Message</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="relative">
                      <label className="text-sm text-gray-400 font-hud uppercase tracking-wider">To</label>
                      {selectedRecipient ? (
                        <div className="flex items-center gap-2 mt-1 p-2 bg-sv-purple/20 border border-sv-purple/50">
                          <Avatar className="w-6 h-6 rounded-none">
                            <AvatarImage src={selectedRecipient.profileImageUrl} className="rounded-none" />
                            <AvatarFallback className="rounded-none bg-sv-purple text-white text-xs">{(selectedRecipient.name || "?")[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-cyber text-white text-sm">{selectedRecipient.name || "Unknown"}</span>
                          <button 
                            className="ml-auto text-gray-400 hover:text-white"
                            onClick={() => setSelectedRecipient(null)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative mt-1">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              placeholder="Search users..."
                              value={recipientSearch}
                              onChange={(e) => setRecipientSearch(e.target.value)}
                              className="pl-8 bg-sv-black border-sv-gray text-white rounded-none font-body"
                              data-testid="input-recipient-search"
                            />
                          </div>
                          {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-sv-dark border border-sv-gray">
                              {searchResults.map((u) => (
                                <button
                                  key={u.id}
                                  className="w-full flex items-center gap-2 p-2 hover:bg-sv-purple/20 transition-colors"
                                  onClick={() => {
                                    setSelectedRecipient(u);
                                    setRecipientSearch("");
                                  }}
                                  data-testid={`select-recipient-${u.id}`}
                                >
                                  <Avatar className="w-6 h-6 rounded-none">
                                    <AvatarImage src={u.profileImageUrl} className="rounded-none" />
                                    <AvatarFallback className="rounded-none bg-sv-purple text-white text-xs">{(u.name || "?")[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-cyber text-white text-sm">{u.name || "Unknown"}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 font-hud uppercase tracking-wider">Subject</label>
                      <Input
                        placeholder="Message subject..."
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                        className="mt-1 bg-sv-black border-sv-gray text-white rounded-none font-body"
                        data-testid="input-message-subject"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 font-hud uppercase tracking-wider">Message</label>
                      <Textarea
                        placeholder="Write your message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="mt-1 bg-sv-black border-sv-gray text-white rounded-none font-body min-h-[120px]"
                        data-testid="input-message-content"
                      />
                    </div>
                    <button
                      className="cyber-btn w-full bg-sv-pink text-black font-cyber font-bold py-2 uppercase tracking-wider disabled:opacity-50"
                      onClick={handleSendMessage}
                      disabled={!selectedRecipient || !messageSubject.trim() || !messageContent.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      ) : (
                        <Send className="w-4 h-4 inline mr-2" />
                      )}
                      Send Message
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="w-full bg-sv-dark border border-sv-gray rounded-none mb-6">
                <TabsTrigger 
                  value="inbox" 
                  className="flex-1 rounded-none font-hud uppercase tracking-wider text-sm data-[state=active]:bg-sv-pink data-[state=active]:text-black"
                  data-testid="tab-inbox"
                >
                  <InboxIcon className="w-4 h-4 mr-2" />
                  Inbox
                  {unreadMessages > 0 && (
                    <span className="ml-2 bg-sv-pink text-black text-xs px-1.5 py-0.5 font-bold">{unreadMessages}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="sent" 
                  className="flex-1 rounded-none font-hud uppercase tracking-wider text-sm data-[state=active]:bg-sv-purple data-[state=active]:text-white"
                  data-testid="tab-sent"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Sent
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex-1 rounded-none font-hud uppercase tracking-wider text-sm data-[state=active]:bg-sv-gold data-[state=active]:text-black"
                  data-testid="tab-notifications"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-2 bg-sv-gold text-black text-xs px-1.5 py-0.5 font-bold">{unreadNotifications}</span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inbox" className="mt-0">
                {messages.length === 0 ? (
                  <div className="text-center py-16 border border-sv-gray/30 bg-sv-dark/50">
                    <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-body">No messages yet</p>
                    <p className="text-gray-500 text-sm mt-1 font-body">Messages from other users will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <button
                        key={message.id}
                        className={`w-full text-left p-4 border transition-colors ${
                          message.read 
                            ? "border-sv-gray/30 bg-sv-dark/30 hover:bg-sv-dark/50" 
                            : "border-sv-pink/30 bg-sv-pink/5 hover:bg-sv-pink/10"
                        }`}
                        onClick={() => handleOpenMessage(message)}
                        data-testid={`message-${message.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 rounded-none border border-sv-purple/50 flex-shrink-0">
                            <AvatarImage src={message.fromUserAvatar} className="rounded-none" />
                            <AvatarFallback className="rounded-none bg-sv-purple text-white font-punk">
                              {message.fromUserName?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-cyber text-white text-sm">{message.fromUserName || "Unknown"}</span>
                              {!message.read && <span className="w-2 h-2 bg-sv-pink" />}
                            </div>
                            <p className="font-body text-white font-medium truncate">{message.subject}</p>
                            <p className="text-gray-400 text-sm truncate font-body">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 font-hud flex-shrink-0">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sent" className="mt-0">
                {sentMessages.length === 0 ? (
                  <div className="text-center py-16 border border-sv-gray/30 bg-sv-dark/50">
                    <Send className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-body">No sent messages</p>
                    <p className="text-gray-500 text-sm mt-1 font-body">Messages you send will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 border border-sv-gray/30 bg-sv-dark/30"
                        data-testid={`sent-message-${message.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 rounded-none border border-sv-purple/50 flex-shrink-0">
                            <AvatarImage src={message.toUserAvatar} className="rounded-none" />
                            <AvatarFallback className="rounded-none bg-sv-purple text-white font-punk">
                              {message.toUserName?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm font-hud">To:</span>
                              <span className="font-cyber text-white text-sm">{message.toUserName || "Unknown"}</span>
                            </div>
                            <p className="font-body text-white font-medium truncate">{message.subject}</p>
                            <p className="text-gray-400 text-sm truncate font-body">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 font-hud flex-shrink-0">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div className="flex justify-end mb-4">
                  {unreadNotifications > 0 && (
                    <button
                      className="text-sm text-sv-pink hover:text-white font-hud uppercase tracking-wider"
                      onClick={() => markAllNotificationsReadMutation.mutate()}
                      data-testid="button-mark-all-notifications-read"
                    >
                      <CheckCheck className="w-4 h-4 inline mr-1" />
                      Mark All Read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center py-16 border border-sv-gray/30 bg-sv-dark/50">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-body">No notifications yet</p>
                    <p className="text-gray-500 text-sm mt-1 font-body">You'll receive notifications when users interact with you</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border transition-colors ${
                          notification.read 
                            ? "border-sv-gray/30 bg-sv-dark/30" 
                            : "border-sv-purple/30 bg-sv-purple/5"
                        }`}
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-white">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1 font-hud">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && <span className="w-2 h-2 bg-sv-purple mt-2" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
              <DialogContent className="bg-sv-dark border-sv-gray rounded-none max-w-lg">
                {selectedMessage && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="font-cyber text-white">{selectedMessage.subject}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-sv-gray/50">
                        <Avatar className="w-10 h-10 rounded-none border border-sv-purple/50">
                          <AvatarImage src={selectedMessage.fromUserAvatar} className="rounded-none" />
                          <AvatarFallback className="rounded-none bg-sv-purple text-white font-punk">
                            {selectedMessage.fromUserName?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-cyber text-white">{selectedMessage.fromUserName}</p>
                          <p className="text-xs text-gray-500 font-hud">
                            {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="py-4">
                        <p className="font-body text-gray-300 whitespace-pre-wrap">{selectedMessage.content}</p>
                      </div>
                      <button
                        className="cyber-btn w-full bg-sv-purple text-white font-cyber font-bold py-2 uppercase tracking-wider"
                        onClick={() => {
                          setSelectedMessage(null);
                          setSelectedRecipient({ id: selectedMessage.fromUserId, name: selectedMessage.fromUserName || "Unknown", profileImageUrl: selectedMessage.fromUserAvatar });
                          setMessageSubject(`Re: ${selectedMessage.subject}`);
                          setComposeOpen(true);
                        }}
                        data-testid="button-reply"
                      >
                        Reply
                      </button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
