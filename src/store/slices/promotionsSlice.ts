import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  status: 'active' | 'inactive';
  expiresAt: string | null;
}

export interface CouponInput {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiresAt: string | null;
}

interface PromotionsState {
  items: Coupon[];
  loading: boolean;
  error: string | null;
}

export const fetchCoupons = createAsyncThunk('promotions/fetchCoupons', async () => {
  const response = await api.get<Coupon[]>('/coupons');
  return response.data ?? [];
});

export const createCouponAsync = createAsyncThunk('promotions/createCoupon', async (input: CouponInput) => {
  const response = await api.post<Coupon>('/coupons', input);
  return response.data!;
});

export const updateCouponAsync = createAsyncThunk(
  'promotions/updateCoupon',
  async ({ id, input }: { id: string; input: Partial<CouponInput> }) => {
    const response = await api.put<Coupon>(`/coupons/${id}`, input);
    return response.data!;
  }
);

export const deleteCouponAsync = createAsyncThunk('promotions/deleteCoupon', async (id: string) => {
  await api.delete(`/coupons/${id}`);
  return id;
});

export const toggleCouponStatusAsync = createAsyncThunk(
  'promotions/toggleCouponStatus',
  async (coupon: Coupon) => {
    const response = await api.put<Coupon>(`/coupons/${coupon.id}`, {
      status: coupon.status === 'active' ? 'inactive' : 'active',
    });
    return response.data!;
  }
);

const initialState: PromotionsState = {
  items: [],
  loading: false,
  error: null,
};

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch coupons';
      })
      .addCase(createCouponAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createCouponAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create coupon';
      })
      .addCase(updateCouponAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update coupon';
      })
      .addCase(toggleCouponStatusAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update coupon status';
      })
      .addCase(deleteCouponAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCouponAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete coupon';
      })
      .addMatcher(
        (action) => [updateCouponAsync.fulfilled.type, toggleCouponStatusAsync.fulfilled.type].includes(action.type),
        (state, action: { payload: Coupon }) => {
          const index = state.items.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        }
      );
  },
});

export const { clearError } = promotionsSlice.actions;
export default promotionsSlice.reducer;
