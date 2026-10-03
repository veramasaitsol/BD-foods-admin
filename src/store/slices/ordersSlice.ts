import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export type OrderStatus = 'placed' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  quantity: number;
  price: number;
  weight: string | null;
  image: string | null;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface DeliveryPartnerSummary {
  id: string;
  name: string;
  phone: string | null;
  vehicleType: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: { id: string; name: string; email: string; phone: string | null } | null;
  deliveryPartnerId: string | null;
  deliveryPartner: DeliveryPartnerSummary | null;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode: string | null;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  statusFilter: OrderStatus | 'all';
  searchQuery: string;
}

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await api.get<Order[]>('/orders?limit=100');
  return response.data ?? [];
});

export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: OrderStatus }) => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data!;
  }
);

export const assignDeliveryPartnerAsync = createAsyncThunk(
  'orders/assignDeliveryPartner',
  async ({ id, deliveryPartnerId }: { id: string; deliveryPartnerId: string }) => {
    const response = await api.patch<Order>(`/orders/${id}/assign`, { deliveryPartnerId });
    return response.data!;
  }
);

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  statusFilter: 'all',
  searchQuery: '',
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<OrderStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(updateOrderStatusAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update order status';
      })
      .addCase(assignDeliveryPartnerAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to assign delivery partner';
      })
      .addMatcher(
        (action) => [updateOrderStatusAsync.fulfilled.type, assignDeliveryPartnerAsync.fulfilled.type].includes(action.type),
        (state, action: { payload: Order }) => {
          const index = state.items.findIndex((o) => o.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        }
      );
  },
});

export const { setStatusFilter, setSearchQuery, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
