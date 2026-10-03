import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export type BannerLinkType = 'product' | 'category' | 'url' | 'none';

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  buttonText: string | null;
  linkType: BannerLinkType;
  productId: string | null;
  categoryId: string | null;
  externalUrl: string | null;
  product: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  sortOrder: number;
  status: 'active' | 'inactive';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface BannerInput {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  linkType: BannerLinkType;
  productId?: string | null;
  categoryId?: string | null;
  externalUrl?: string;
  sortOrder?: number;
  status?: 'active' | 'inactive';
  startDate?: string | null;
  endDate?: string | null;
  image?: File | null;
}

interface BannersState {
  items: Banner[];
  loading: boolean;
  error: string | null;
}

function buildFormData(input: BannerInput): FormData {
  const fd = new FormData();
  fd.append('title', input.title);
  if (input.subtitle !== undefined) fd.append('subtitle', input.subtitle);
  if (input.description !== undefined) fd.append('description', input.description);
  if (input.buttonText !== undefined) fd.append('buttonText', input.buttonText);
  fd.append('linkType', input.linkType);
  if (input.productId !== undefined && input.productId !== null) fd.append('productId', String(input.productId));
  if (input.categoryId !== undefined && input.categoryId !== null) fd.append('categoryId', String(input.categoryId));
  if (input.externalUrl !== undefined) fd.append('externalUrl', input.externalUrl);
  if (input.sortOrder !== undefined) fd.append('sortOrder', String(input.sortOrder));
  if (input.status !== undefined) fd.append('status', input.status);
  if (input.startDate !== undefined) fd.append('startDate', input.startDate || '');
  if (input.endDate !== undefined) fd.append('endDate', input.endDate || '');
  if (input.image instanceof File) fd.append('image', input.image);
  return fd;
}

export const fetchBanners = createAsyncThunk('banners/fetchBanners', async () => {
  const response = await api.get<Banner[]>('/banners');
  return response.data ?? [];
});

export const createBanner = createAsyncThunk('banners/createBanner', async (input: BannerInput) => {
  const response = await api.post<Banner>('/banners', buildFormData(input));
  return response.data!;
});

export const updateBanner = createAsyncThunk(
  'banners/updateBanner',
  async ({ id, input }: { id: string; input: BannerInput }) => {
    const response = await api.put<Banner>(`/banners/${id}`, buildFormData(input));
    return response.data!;
  }
);

export const toggleBannerStatus = createAsyncThunk('banners/toggleBannerStatus', async (banner: Banner) => {
  const response = await api.put<Banner>(`/banners/${banner.id}`, {
    status: banner.status === 'active' ? 'inactive' : 'active',
  });
  return response.data!;
});

export const deleteBanner = createAsyncThunk('banners/deleteBanner', async (id: string) => {
  await api.delete(`/banners/${id}`);
  return id;
});

const initialState: BannersState = {
  items: [],
  loading: false,
  error: null,
};

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch banners';
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.sortOrder - b.sortOrder);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create banner';
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update banner';
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update banner status';
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete banner';
      })
      .addMatcher(
        (action) => [updateBanner.fulfilled.type, toggleBannerStatus.fulfilled.type].includes(action.type),
        (state, action: PayloadAction<Banner>) => {
          const index = state.items.findIndex((b) => b.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
          state.items.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      );
  },
});

export const { clearError } = bannersSlice.actions;
export default bannersSlice.reducer;
