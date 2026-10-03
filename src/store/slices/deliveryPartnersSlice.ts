import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  status: 'active' | 'inactive';
  isOnDuty: boolean;
  availability: 'available' | 'busy' | 'offline';
  lastLogin: string | null;
  createdAt: string;
}

export interface DeliveryPartnerInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

interface DeliveryPartnersState {
  items: DeliveryPartner[];
  loading: boolean;
  error: string | null;
}

export const fetchDeliveryPartners = createAsyncThunk('deliveryPartners/fetchAll', async () => {
  const response = await api.get<DeliveryPartner[]>('/delivery-partners');
  return response.data ?? [];
});

export const createDeliveryPartnerAsync = createAsyncThunk('deliveryPartners/create', async (input: DeliveryPartnerInput) => {
  const response = await api.post<DeliveryPartner>('/delivery-partners', input);
  return response.data!;
});

export const updateDeliveryPartnerAsync = createAsyncThunk(
  'deliveryPartners/update',
  async ({ id, input }: { id: string; input: Partial<DeliveryPartnerInput> }) => {
    const response = await api.put<DeliveryPartner>(`/delivery-partners/${id}`, input);
    return response.data!;
  }
);

export const toggleDeliveryPartnerStatusAsync = createAsyncThunk(
  'deliveryPartners/toggleStatus',
  async (partner: DeliveryPartner) => {
    const nextStatus = partner.status === 'active' ? 'inactive' : 'active';
    const response = await api.patch<DeliveryPartner>(`/delivery-partners/${partner.id}/status`, { status: nextStatus });
    return response.data!;
  }
);

export const deleteDeliveryPartnerAsync = createAsyncThunk('deliveryPartners/delete', async (id: string) => {
  await api.delete(`/delivery-partners/${id}`);
  return id;
});

const initialState: DeliveryPartnersState = {
  items: [],
  loading: false,
  error: null,
};

const deliveryPartnersSlice = createSlice({
  name: 'deliveryPartners',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDeliveryPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch delivery partners';
      })
      .addCase(createDeliveryPartnerAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createDeliveryPartnerAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add delivery partner';
      })
      .addCase(updateDeliveryPartnerAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update delivery partner';
      })
      .addCase(toggleDeliveryPartnerStatusAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update status';
      })
      .addCase(deleteDeliveryPartnerAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteDeliveryPartnerAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove delivery partner';
      })
      .addMatcher(
        (action) => [updateDeliveryPartnerAsync.fulfilled.type, toggleDeliveryPartnerStatusAsync.fulfilled.type].includes(action.type),
        (state, action: { payload: DeliveryPartner }) => {
          const index = state.items.findIndex((p) => p.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        }
      );
  },
});

export const { clearError } = deliveryPartnersSlice.actions;
export default deliveryPartnersSlice.reducer;
