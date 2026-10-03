import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
  selectUnreadNotificationCount,
} from '@/store/slices/notificationsSlice';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsModal = ({ open, onClose }: NotificationsModalProps) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);

  useEffect(() => {
    if (open) dispatch(fetchNotifications());
  }, [open, dispatch]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="font-heading">Notifications</DialogTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => dispatch(markAllNotificationsRead())}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </DialogHeader>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Bell className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 transition-colors',
                  !notification.isRead && 'bg-primary/5 border-primary/20'
                )}
                onClick={() => {
                  if (!notification.isRead) dispatch(markNotificationRead(notification.id));
                }}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                  <div className={!notification.isRead ? '' : 'ml-4'}>
                    <p className={cn('text-sm text-foreground', !notification.isRead ? 'font-semibold' : 'font-medium')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
