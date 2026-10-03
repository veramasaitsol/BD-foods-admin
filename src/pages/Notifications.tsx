import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
  selectUnreadNotificationCount,
} from '@/store/slices/notificationsSlice';
import { Bell, CheckCheck, Send, Inbox, MailOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import SendNotificationModal from '@/components/modals/SendNotificationModal';

const Notifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const readCount = notifications.length - unreadCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay on top of orders and account activity</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" className="gap-2" onClick={() => dispatch(markAllNotificationsRead())}>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          <Button className="gap-2" onClick={() => setShowSendModal(true)}>
            <Send className="h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <h3 className="text-2xl font-bold">{notifications.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <h3 className="text-2xl font-bold">{unreadCount}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <MailOpen className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <h3 className="text-2xl font-bold">{readCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      <SendNotificationModal open={showSendModal} onClose={() => setShowSendModal(false)} />

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                When there's activity on your store — new orders, reviews, or alerts — they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors border',
                    !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card border-border hover:bg-muted/30'
                  )}
                  onClick={() => {
                    if (!notification.isRead) dispatch(markNotificationRead(notification.id));
                  }}
                >
                  {!notification.isRead && (
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <div className={cn('flex-1 min-w-0', notification.isRead && 'ml-[18px]')}>
                    <div className="flex items-center gap-2">
                      <p className={cn('text-foreground', !notification.isRead ? 'font-semibold' : 'font-medium')}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {new Date(notification.createdAt).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
