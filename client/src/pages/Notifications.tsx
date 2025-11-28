import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Trash2, CheckCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to login to view notifications</p>
            <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-white/90">
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user.id],
    queryFn: () => getNotifications(user.id),
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
      toast({ title: "All notifications marked as read" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Inbox</h1>
                <p className="text-muted-foreground mt-2">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            {notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      notification.read
                        ? "border-white/5 bg-white/2"
                        : "border-violet-500/30 bg-violet-500/5"
                    }`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {notification.fromUserName && (
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={notification.fromUserAvatar} />
                          <AvatarFallback>{notification.fromUserName[0]}</AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex-grow min-w-0">
                        <p className="text-white font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {!notification.read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          data-testid="button-mark-read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No notifications yet</p>
                <p className="text-muted-foreground text-sm mt-2">
                  You'll receive notifications when users follow you or interact with your battles.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
