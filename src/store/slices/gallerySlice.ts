import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface GalleryItemInput {
  title: string;
  description?: string;
  mediaType: 'photo' | 'video';
  sortOrder?: number;
  status?: 'active' | 'inactive';
  media?: File | null;
}

interface GalleryState {
  items: GalleryItem[];
  loading: boolean;
  error: string | null;
}

function buildFormData(input: GalleryItemInput): FormData {
  const fd = new FormData();
  fd.append('title', input.title);
  if (input.description !== undefined) fd.append('description', input.description);
  fd.append('mediaType', input.mediaType);
  if (input.sortOrder !== undefined) fd.append('sortOrder', String(input.sortOrder));
  if (input.status !== undefined) fd.append('status', input.status);
  if (input.media instanceof File) fd.append('media', input.media);
  return fd;
}

export const fetchGalleryItems = createAsyncThunk('gallery/fetchGalleryItems', async () => {
  const response = await api.get<GalleryItem[]>('/gallery');
  return response.data ?? [];
});

export const createGalleryItem = createAsyncThunk('gallery/createGalleryItem', async (input: GalleryItemInput) => {
  const response = await api.post<GalleryItem>('/gallery', buildFormData(input));
  return response.data!;
});

export const updateGalleryItem = createAsyncThunk(
  'gallery/updateGalleryItem',
  async ({ id, input }: { id: string; input: GalleryItemInput }) => {
    const response = await api.put<GalleryItem>(`/gallery/${id}`, buildFormData(input));
    return response.data!;
  }
);

export const toggleGalleryItemStatus = createAsyncThunk('gallery/toggleGalleryItemStatus', async (item: GalleryItem) => {
  const response = await api.put<GalleryItem>(`/gallery/${item.id}`, {
    status: item.status === 'active' ? 'inactive' : 'active',
  });
  return response.data!;
});

export const deleteGalleryItem = createAsyncThunk('gallery/deleteGalleryItem', async (id: string) => {
  await api.delete(`/gallery/${id}`);
  return id;
});

const initialState: GalleryState = {
  items: [],
  loading: false,
  error: null,
};

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGalleryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch gallery items';
      })
      .addCase(createGalleryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.sortOrder - b.sortOrder);
      })
      .addCase(createGalleryItem.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create gallery item';
      })
      .addCase(updateGalleryItem.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update gallery item';
      })
      .addCase(toggleGalleryItemStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update gallery item status';
      })
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteGalleryItem.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete gallery item';
      })
      .addMatcher(
        (action) => [updateGalleryItem.fulfilled.type, toggleGalleryItemStatus.fulfilled.type].includes(action.type),
        (state, action: PayloadAction<GalleryItem>) => {
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
          state.items.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      );
  },
});

export const { clearError } = gallerySlice.actions;
export default gallerySlice.reducer;
