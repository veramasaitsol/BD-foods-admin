import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import customersReducer from './slices/customersSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import promotionsReducer from './slices/promotionsSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import settingsReducer from './slices/settingsSlice';
import bannersReducer from './slices/bannersSlice';
import deliveryPartnersReducer from './slices/deliveryPartnersSlice';
import notificationsReducer from './slices/notificationsSlice';
import reviewsReducer from './slices/reviewsSlice';
import galleryReducer from './slices/gallerySlice';
import faqsReducer from './slices/faqsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    categories: categoriesReducer,
    promotions: promotionsReducer,
    adminUsers: adminUsersReducer,
    settings: settingsReducer,
    banners: bannersReducer,
    deliveryPartners: deliveryPartnersReducer,
    notifications: notificationsReducer,
    reviews: reviewsReducer,
    gallery: galleryReducer,
    faqs: faqsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;