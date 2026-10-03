import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FaqInput {
  question: string;
  answer: string;
  sortOrder?: number;
  status?: 'active' | 'inactive';
}

interface FaqsState {
  items: Faq[];
  loading: boolean;
  error: string | null;
}

export const fetchFaqs = createAsyncThunk('faqs/fetchFaqs', async () => {
  const response = await api.get<Faq[]>('/faqs');
  return response.data ?? [];
});

export const createFaq = createAsyncThunk('faqs/createFaq', async (input: FaqInput) => {
  const response = await api.post<Faq>('/faqs', input);
  return response.data!;
});

export const updateFaq = createAsyncThunk(
  'faqs/updateFaq',
  async ({ id, input }: { id: string; input: FaqInput }) => {
    const response = await api.put<Faq>(`/faqs/${id}`, input);
    return response.data!;
  }
);

export const deleteFaq = createAsyncThunk('faqs/deleteFaq', async (id: string) => {
  await api.delete(`/faqs/${id}`);
  return id;
});

const initialState: FaqsState = {
  items: [],
  loading: false,
  error: null,
};

const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch FAQs';
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.sortOrder - b.sortOrder);
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create FAQ';
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update FAQ';
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.items = state.items.filter((faq) => faq.id !== action.payload);
      })
      .addCase(deleteFaq.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete FAQ';
      })
      .addMatcher(
        (action) => action.type === updateFaq.fulfilled.type,
        (state, action: PayloadAction<Faq>) => {
          const index = state.items.findIndex((faq) => faq.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
          state.items.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      );
  },
});

export const { clearError } = faqsSlice.actions;
export default faqsSlice.reducer;
