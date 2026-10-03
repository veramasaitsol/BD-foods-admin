import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const response = await api.get<AppNotification[]>('/notifications');
  return { items: response.data || [], unreadCount: response.meta?.unreadCount || 0 };
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id: string) => {
  const response = await api.patch<AppNotification>(`/notifications/${id}/read`);
  return response.data!;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.patch('/notifications/read-all');
});

export interface SendNotificationInput {
  target: 'specific' | 'all';
  userId?: string;
  title: string;
  message: string;
}

export const sendNotification = createAsyncThunk('notifications/send', async (input: SendNotificationInput) => {
  const response = await api.post<AppNotification>('/notifications/send', input);
  return response.message;
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: { payload: AppNotification }) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload.id);
        if (item && !item.isRead) {
          item.isRead = true;
          item.readAt = action.payload.readAt;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationsSlice.actions;

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.items;
export const selectUnreadNotificationCount = (state: { notifications: NotificationsState }) =>
  state.notifications.unreadCount;

export default notificationsSlice.reducer;
