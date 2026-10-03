import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { getAuthToken, api } from '@/lib/api';
import { requestFcmToken, listenForForegroundMessages } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchBanners } from '@/store/slices/bannersSlice';
import { fetchGalleryItems } from '@/store/slices/gallerySlice';
import { fetchFaqs } from '@/store/slices/faqsSlice';
import { fetchSettings } from '@/store/slices/settingsSlice';
import { addNotification, fetchNotifications, AppNotification } from '@/store/slices/notificationsSlice';
import { fetchDeliveryPartners } from '@/store/slices/deliveryPartnersSlice';

interface LiveOrder {
  orderNumber: string;
  total: number;
}

export function useLiveUpdates() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    const socket = connectSocket(token);

    dispatch(fetchNotifications());

    requestFcmToken()
      .then((fcmToken) => {
        if (fcmToken) {
          return api.patch('/user/fcm-token', { fcmToken });
        }
      })
      .catch((err) => console.warn('[push] FCM token registration failed:', err));

    listenForForegroundMessages(({ title, body }) => {
      toast({ title: title || 'New notification', description: body });
    });

    socket.on('notification:new', (notification: AppNotification) => {
      dispatch(addNotification(notification));
      toast({ title: notification.title, description: notification.message });
    });

    socket.on('order:created', (order: LiveOrder) => {
      toast({
        title: 'New order received',
        description: `${order.orderNumber} — ₹${order.total}`,
      });
      dispatch(fetchOrders());
      dispatch(fetchDashboardStats());
    });

    socket.on('order:updated', () => {
      dispatch(fetchOrders());
      dispatch(fetchDashboardStats());
    });

    socket.on('products:changed', () => {
      dispatch(fetchProducts());
      dispatch(fetchDashboardStats());
    });
    socket.on('categories:changed', () => dispatch(fetchCategories()));
    socket.on('banners:changed', () => dispatch(fetchBanners()));
    socket.on('gallery:changed', () => dispatch(fetchGalleryItems()));
    socket.on('faqs:changed', () => dispatch(fetchFaqs()));
    socket.on('settings:changed', () => dispatch(fetchSettings()));
    socket.on('delivery-partner:updated', () => dispatch(fetchDeliveryPartners()));

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch]);
}
