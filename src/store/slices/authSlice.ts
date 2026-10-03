import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'staff';
  avatar?: string;
}

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  loading: boolean;
}

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === 'number' && Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
}

function loadStoredAdmin(): Admin | null {
  try {
    const token = localStorage.getItem('authToken');
    const rawUser = localStorage.getItem('user');
    if (!token || !rawUser || !isTokenValid(token)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }

    const user = JSON.parse(rawUser);
    return {
      id: String(user.USER_ID),
      name: user.NAME,
      email: user.EMAIL,
      role: String(user.ROLE).toLowerCase() as Admin['role'],
    };
  } catch {
    return null;
  }
}

const storedAdmin = loadStoredAdmin();

const initialState: AuthState = {
  admin: storedAdmin,
  isAuthenticated: !!storedAdmin,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<Admin>) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAdmin, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
