import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export type AdminRole = 'super_admin' | 'manager' | 'staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminUserInput {
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
}

interface AdminUsersState {
  items: AdminUser[];
  loading: boolean;
  error: string | null;
}

export const fetchAdminUsers = createAsyncThunk('adminUsers/fetchAll', async () => {
  const response = await api.get<AdminUser[]>('/admin-users');
  return response.data ?? [];
});

export const createAdminUserAsync = createAsyncThunk('adminUsers/create', async (input: AdminUserInput) => {
  const response = await api.post<AdminUser>('/admin-users', input);
  return response.data!;
});

export const updateAdminUserAsync = createAsyncThunk(
  'adminUsers/update',
  async ({ id, input }: { id: string; input: { name?: string; role?: AdminRole } }) => {
    const response = await api.put<AdminUser>(`/admin-users/${id}`, input);
    return response.data!;
  }
);

export const toggleAdminUserStatusAsync = createAsyncThunk(
  'adminUsers/toggleStatus',
  async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const response = await api.patch<AdminUser>(`/admin-users/${user.id}/status`, { status: nextStatus });
    return response.data!;
  }
);

export const deleteAdminUserAsync = createAsyncThunk('adminUsers/delete', async (id: string) => {
  await api.delete(`/admin-users/${id}`);
  return id;
});

const initialState: AdminUsersState = {
  items: [],
  loading: false,
  error: null,
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin users';
      })
      .addCase(createAdminUserAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createAdminUserAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create admin user';
      })
      .addCase(updateAdminUserAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update admin user';
      })
      .addCase(toggleAdminUserStatusAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update status';
      })
      .addCase(deleteAdminUserAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteAdminUserAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete admin user';
      })
      .addMatcher(
        (action) => [updateAdminUserAsync.fulfilled.type, toggleAdminUserStatusAsync.fulfilled.type].includes(action.type),
        (state, action: { payload: AdminUser }) => {
          const index = state.items.findIndex((u) => u.id === action.payload.id);
          if (index !== -1) state.items[index] = action.payload;
        }
      );
  },
});

export const { clearError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
