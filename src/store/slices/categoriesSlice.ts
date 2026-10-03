import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  productCount: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryInput {
  name: string;
  description: string;
  image: File | string | null;
}

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await api.get<Category[]>('/categories', { auth: false });
  return response.data ?? [];
});

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData: CategoryInput) => {
  const formData = new FormData();
  formData.append('CATEGORY_NAME', categoryData.name);
  formData.append('CATEGORY_DESCRIPTION', categoryData.description);
  if (categoryData.image instanceof File) {
    formData.append('CATEGORY_IMAGE', categoryData.image);
  }

  const response = await api.post<Category>('/categories/create', formData);
  return response.data!;
});

export const updateCategoryAsync = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }: { id: string; categoryData: CategoryInput }) => {
    let response;
    if (categoryData.image instanceof File) {
      const formData = new FormData();
      formData.append('CATEGORY_NAME', categoryData.name);
      formData.append('CATEGORY_DESCRIPTION', categoryData.description);
      formData.append('CATEGORY_IMAGE', categoryData.image);
      response = await api.put<Category>(`/categories/update/${id}`, formData);
    } else {
      response = await api.put<Category>(`/categories/update/${id}`, {
        LATEST_CATEGORY: { name: categoryData.name, description: categoryData.description },
      });
    }
    return response.data!;
  }
);

export const deleteCategoryAsync = createAsyncThunk('categories/deleteCategory', async (id: string) => {
  await api.delete(`/categories/delete/${id}`);
  return id;
});

export const reorderCategoriesAsync = createAsyncThunk(
  'categories/reorderCategories',
  async (categoryIds: string[]) => {
    const response = await api.patch<Category[]>('/categories/reorder', { categoryIds });
    return response.data ?? [];
  }
);

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCategoriesOrder: (state, action: { payload: Category[] }) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch categories';
    });

    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.items.push(action.payload);
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create category';
    });

    builder.addCase(updateCategoryAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCategoryAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(updateCategoryAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update category';
    });

    builder.addCase(deleteCategoryAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCategoryAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.items = state.items.filter((c) => c.id !== action.payload);
    });
    builder.addCase(deleteCategoryAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete category';
    });

    builder.addCase(reorderCategoriesAsync.fulfilled, (state, action) => {
      state.items = action.payload;
    });
    builder.addCase(reorderCategoriesAsync.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to reorder categories';
    });
  },
});

export const { clearError, setCategoriesOrder } = categoriesSlice.actions;
export default categoriesSlice.reducer;
