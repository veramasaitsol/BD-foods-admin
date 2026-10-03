import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from './store/hooks';
import { useLiveUpdates } from './hooks/useLiveUpdates';
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import DeliveryPartners from "./pages/DeliveryPartners";
import Promotions from "./pages/Promotions";
import Banners from "./pages/Banners";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import Gallery from "./pages/Gallery";
import Faqs from "./pages/Faqs";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  useLiveUpdates();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/delivery-partners" element={<DeliveryPartners />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;