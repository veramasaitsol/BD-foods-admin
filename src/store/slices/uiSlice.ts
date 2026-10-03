import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    addNotification: (state, action: PayloadAction<{ id: string; message: string; type: 'success' | 'error' | 'info' }>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal, addNotification, removeNotification } = uiSlice.actions;
export default uiSlice.reducer;