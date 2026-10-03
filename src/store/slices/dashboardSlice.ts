import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  totalProducts: number;
  activeCustomers: number;
}

interface SalesData {
  name: string;
  sales: number;
  orders: number;
}

interface SalesChartPoint {
  date: string;
  sales: number;
  orders: number;
}

interface DashboardState {
  stats: DashboardStats;
  salesData: SalesData[];
  loading: boolean;
  error: string | null;
}

const emptyStats: DashboardStats = {
  totalSales: 0,
  ordersToday: 0,
  totalProducts: 0,
  activeCustomers: 0,
};

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data ?? emptyStats;
});

export const fetchSalesChart = createAsyncThunk('dashboard/fetchSalesChart', async (range: 'week' | 'month' = 'week') => {
  const response = await api.get<SalesChartPoint[]>(`/dashboard/sales-chart?range=${range}`);
  return (response.data ?? []).map((point) => ({
    name: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: point.sales,
    orders: point.orders,
  }));
});

const initialState: DashboardState = {
  stats: emptyStats,
  salesData: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesData = action.payload;
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch sales chart';
      });
  },
});

export default dashboardSlice.reducer;
