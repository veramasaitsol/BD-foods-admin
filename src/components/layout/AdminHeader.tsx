import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { setSearchQuery as setProductSearch } from '@/store/slices/productsSlice';
import { setSearchQuery as setOrderSearch } from '@/store/slices/ordersSlice';
import { setSearchQuery as setCustomerSearch } from '@/store/slices/customersSlice';
import {
  selectNotifications,
  selectUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/slices/notificationsSlice';
import { Bell, CheckCheck, Search, User, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import NotificationsModal from '@/components/modals/NotificationsModal';

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const { admin } = useAppSelector((state) => state.auth);
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    // One box searches all three lists — each page's own search field
    // stays pre-filled if the admin then clicks over to it.
    dispatch(setProductSearch(query));
    dispatch(setOrderSearch(query));
    dispatch(setCustomerSearch(query));
    navigate('/products');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300',
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-64',
        'left-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - hidden on mobile */}
        <form onSubmit={handleSearch} className="relative w-96 max-w-md hidden md:block">
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orders, customers..."
            className="pl-10 input-search"
          />
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground text-center">No notifications yet</p>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 8).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => {
                        if (!notification.isRead) dispatch(markNotificationRead(notification.id));
                      }}
                      className={cn(
                        'flex flex-col items-start gap-0.5 whitespace-normal py-2',
                        !notification.isRead && 'bg-primary/5'
                      )}
                    >
                      <span className="text-sm font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowNotificationsModal(true)} className="justify-center text-sm text-primary">
                View all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {admin?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{admin?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {admin?.role?.replace('_', ' ')}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowLogoutConfirm(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NotificationsModal open={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} />
    </header>
  );
};

export default AdminHeader;