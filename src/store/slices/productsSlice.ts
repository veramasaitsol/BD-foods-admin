import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface ProductVariant {
  label: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  weight: string | null;
  category: { id: string; name: string } | null;
  categoryId: string | null;
  stock: number;
  inStock: boolean;
  image: string | null;
  images: string[];
  status: 'active' | 'inactive';
  isBestSeller: boolean;
  isFeatured: boolean;
  variants: ProductVariant[] | null;
  createdAt: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number | null;
  weight?: string;
  categoryId?: string | null;
  stock?: number;
  status?: 'active' | 'inactive';
  isBestSeller?: boolean;
  isFeatured?: boolean;
  variants?: ProductVariant[];
  images?: File[];
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
}

function buildFormData(input: ProductInput): FormData {
  const fd = new FormData();
  fd.append('name', input.name);
  if (input.description !== undefined) fd.append('description', input.description);
  fd.append('price', String(input.price));
  if (input.discountedPrice !== undefined && input.discountedPrice !== null) {
    fd.append('discountedPrice', String(input.discountedPrice));
  }
  if (input.weight) fd.append('weight', input.weight);
  if (input.categoryId !== undefined && input.categoryId !== null) fd.append('categoryId', String(input.categoryId));
  if (input.stock !== undefined) fd.append('stock', String(input.stock));
  if (input.status) fd.append('status', input.status);
  if (input.isBestSeller !== undefined) fd.append('isBestSeller', String(input.isBestSeller));
  if (input.isFeatured !== undefined) fd.append('isFeatured', String(input.isFeatured));
  if (input.variants !== undefined) fd.append('variants', JSON.stringify(input.variants));
  (input.images || []).forEach((file) => fd.append('images', file));
  return fd;
}

function filenameFromUrl(url: string): string {
  return url.split('/').pop() || url;
}

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await api.get<Product[]>('/products?limit=100', { auth: false });
  return response.data ?? [];
});

export const addProduct = createAsyncThunk('products/addProduct', async (input: ProductInput) => {
  const response = await api.post<Product>('/products', buildFormData(input));
  return response.data!;
});

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, input }: { id: string; input: ProductInput }) => {
    const response = await api.put<Product>(`/products/${id}`, buildFormData(input));
    return response.data!;
  }
);

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: string) => {
  await api.delete(`/products/${id}`);
  return id;
});

export const toggleProductStatus = createAsyncThunk('products/toggleProductStatus', async (product: Product) => {
  const response = await api.put<Product>(`/products/${product.id}`, {
    status: product.status === 'active' ? 'inactive' : 'active',
  });
  return response.data!;
});

export const toggleBestSeller = createAsyncThunk('products/toggleBestSeller', async (product: Product) => {
  const response = await api.put<Product>(`/products/${product.id}`, {
    isBestSeller: !product.isBestSeller,
  });
  return response.data!;
});

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock }: { id: string; stock: number }) => {
    const response = await api.patch<Product>(`/products/${id}/stock`, { stock });
    return response.data!;
  }
);

export const deleteProductImage = createAsyncThunk(
  'products/deleteProductImage',
  async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
    const response = await api.delete<Product>(`/products/${id}/images/${filenameFromUrl(imageUrl)}`);
    return response.data!;
  }
);

export const reorderProductImages = createAsyncThunk(
  'products/reorderProductImages',
  async ({ id, imageUrls }: { id: string; imageUrls: string[] }) => {
    const response = await api.patch<Product>(`/products/${id}/images/reorder`, {
      images: imageUrls.map(filenameFromUrl),
    });
    return response.data!;
  }
);

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: 'all',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add product';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update product';
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update product status';
      })
      .addCase(toggleBestSeller.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update best seller status';
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update stock';
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete product';
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to remove image';
      })
      .addCase(reorderProductImages.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to reorder images';
      })
      .addMatcher(
        (action) => [
          updateProduct.fulfilled.type,
          toggleProductStatus.fulfilled.type,
          toggleBestSeller.fulfilled.type,
          updateStock.fulfilled.type,
          deleteProductImage.fulfilled.type,
          reorderProductImages.fulfilled.type,
        ].includes(action.type),
        (state, action: PayloadAction<Product>) => {
          const index = state.items.findIndex((p) => p.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        }
      );
  },
});

export const { setSearchQuery, setSelectedCategory, clearError } = productsSlice.actions;
export default productsSlice.reducer;
