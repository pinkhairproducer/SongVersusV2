import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChatMessages, sendChatMessage } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playSound } = useSoundEffects();

  const { data: messages } = useQuery({
    queryKey: ["chat"],
    queryFn: fetchChatMessages,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => sendChatMessage(user!.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      setInputText("");
      playSound("chatMessage");
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        variant: "destructive",
      });
      playSound("error");
    },
  });

  useEffect(() => {
    if (messages && isOpen) {
      const messageCount = messages.length;
      if (prevMessageCountRef.current > 0 && messageCount > prevMessageCountRef.current) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.userId !== user?.id) {
          playSound("chatMessage");
        }
      }
      prevMessageCountRef.current = messageCount;
    }
  }, [messages, isOpen, user?.id, playSound]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    sendMessageMutation.mutate(inputText);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-white text-sm">Global Chat</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> 124 Online
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
              {(messages || []).map((msg) => {
                const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 border border-white/10 mt-1 flex-shrink-0">
                      <AvatarImage src={msg.userAvatar} />
                      <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{msg.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-white/5 p-2 rounded-r-xl rounded-bl-xl">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <form 
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              >
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={user ? "Type a message..." : "Login to chat"}
                  className="bg-white/5 border-white/10 focus-visible:ring-violet-500 h-9 text-sm"
                  disabled={!user}
                />
                <Button type="submit" size="icon" className="h-9 w-9 bg-violet-500 hover:bg-violet-600 text-white" disabled={!user}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="lg" 
        className={`rounded-full h-14 w-14 shadow-lg shadow-violet-500/20 transition-all duration-300 ${isOpen ? 'bg-white text-black hover:bg-white/90' : 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-110'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>
    </div>
  );
}
