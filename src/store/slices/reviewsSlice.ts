import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export type ReviewStatus = 'approved' | 'hidden';

export interface Review {
  id: string;
  productId: string;
  product: { id: string; name: string; image: string | null } | null;
  userId: string;
  customer: { id: string; name: string } | null;
  orderId: string | null;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsState {
  items: Review[];
  loading: boolean;
  error: string | null;
  statusFilter: ReviewStatus | 'all';
}

export const fetchReviews = createAsyncThunk('reviews/fetchAll', async () => {
  const response = await api.get<Review[]>('/reviews/admin?limit=100');
  return response.data ?? [];
});

export const moderateReviewAsync = createAsyncThunk(
  'reviews/moderate',
  async ({ id, status }: { id: string; status: ReviewStatus }) => {
    const response = await api.patch<Review>(`/reviews/${id}/status`, { status });
    return response.data!;
  }
);

export const deleteReviewAsync = createAsyncThunk('reviews/delete', async (id: string) => {
  await api.delete(`/reviews/${id}`);
  return id;
});

const initialState: ReviewsState = {
  items: [],
  loading: false,
  error: null,
  statusFilter: 'all',
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<ReviewStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(moderateReviewAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(moderateReviewAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update review';
      })
      .addCase(deleteReviewAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteReviewAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete review';
      });
  },
});

export const { setStatusFilter, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
