import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  joinedAt: string;
  lastOrderAt: string | null;
}

interface CustomersState {
  items: Customer[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
  const response = await api.get<Customer[]>('/customers');
  return response.data ?? [];
});

export const toggleCustomerStatusAsync = createAsyncThunk(
  'customers/toggleCustomerStatus',
  async (customer: Customer) => {
    const nextStatus = customer.status === 'active' ? 'blocked' : 'active';
    await api.patch(`/customers/${customer.id}/status`, { status: nextStatus });
    return { id: customer.id, status: nextStatus as Customer['status'] };
  }
);

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(toggleCustomerStatusAsync.fulfilled, (state, action) => {
        const customer = state.items.find((c) => c.id === action.payload.id);
        if (customer) customer.status = action.payload.status;
      })
      .addCase(toggleCustomerStatusAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update customer status';
      });
  },
});

export const { setSearchQuery, clearError } = customersSlice.actions;
export default customersSlice.reducer;
