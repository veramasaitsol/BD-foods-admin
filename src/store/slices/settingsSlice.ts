import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface DeliveryZone {
  id: string;
  label: string;
  description: string;
  charge: number;
  enabled: boolean;
}

export interface DeliveryZonesConfig {
  zones: DeliveryZone[];
  freeDeliveryThreshold: number;
}

export interface PaymentMethodsConfig {
  card: boolean;
  upi: boolean;
  cod: boolean;
  netBanking: boolean;
}

export interface TaxCategoryRate {
  category: string;
  rate: number;
}

export interface TaxConfig {
  gstNumber: string;
  panNumber: string;
  categoryRates: TaxCategoryRate[];
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storePhone2: string;
  storeWebsite: string;
  storeAddress: string;
  deliveryZones: DeliveryZonesConfig;
  paymentMethods: PaymentMethodsConfig;
  tax: TaxConfig;
  aboutContent: string;
  contactMessage: string;
  termsContent: string;
  privacyContent: string;
  partnerAboutContent: string;
  partnerContactMessage: string;
  partnerTermsContent: string;
  partnerPrivacyContent: string;
}

interface SettingsState {
  data: StoreSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const defaultSettings: StoreSettings = {
  storeName: 'Brundhavanam Desi Foods',
  storeEmail: '',
  storePhone: '',
  storePhone2: '',
  storeWebsite: '',
  storeAddress: '',
  deliveryZones: {
    zones: [
      { id: 'local', label: 'Local Delivery (0-10 km)', description: 'Within city limits', charge: 40, enabled: true },
      { id: 'extended', label: 'Extended Delivery (10-25 km)', description: 'Suburban areas', charge: 80, enabled: true },
      { id: 'pan-india', label: 'Pan India Shipping', description: 'Courier delivery', charge: 150, enabled: true },
    ],
    freeDeliveryThreshold: 500,
  },
  paymentMethods: { card: true, upi: true, cod: true, netBanking: true },
  tax: {
    gstNumber: '',
    panNumber: '',
    categoryRates: [
      { category: 'Food Items (Packaged)', rate: 5 },
      { category: 'Oils', rate: 5 },
      { category: 'Sweets', rate: 5 },
      { category: 'Snacks', rate: 12 },
    ],
  },
  aboutContent: '',
  contactMessage: '',
  termsContent: '',
  privacyContent: '',
  partnerAboutContent: '',
  partnerContactMessage: '',
  partnerTermsContent: '',
  partnerPrivacyContent: '',
};

function mergeSettings(partial: Partial<StoreSettings> | undefined): StoreSettings {
  if (!partial) return defaultSettings;
  return {
    storeName: partial.storeName ?? defaultSettings.storeName,
    storeEmail: partial.storeEmail ?? defaultSettings.storeEmail,
    storePhone: partial.storePhone ?? defaultSettings.storePhone,
    storePhone2: partial.storePhone2 ?? defaultSettings.storePhone2,
    storeWebsite: partial.storeWebsite ?? defaultSettings.storeWebsite,
    storeAddress: partial.storeAddress ?? defaultSettings.storeAddress,
    deliveryZones: partial.deliveryZones?.zones?.length ? partial.deliveryZones : defaultSettings.deliveryZones,
    paymentMethods: partial.paymentMethods ? { ...defaultSettings.paymentMethods, ...partial.paymentMethods } : defaultSettings.paymentMethods,
    tax: partial.tax?.categoryRates?.length ? partial.tax : defaultSettings.tax,
    aboutContent: partial.aboutContent ?? defaultSettings.aboutContent,
    contactMessage: partial.contactMessage ?? defaultSettings.contactMessage,
    termsContent: partial.termsContent ?? defaultSettings.termsContent,
    privacyContent: partial.privacyContent ?? defaultSettings.privacyContent,
    partnerAboutContent: partial.partnerAboutContent ?? defaultSettings.partnerAboutContent,
    partnerContactMessage: partial.partnerContactMessage ?? defaultSettings.partnerContactMessage,
    partnerTermsContent: partial.partnerTermsContent ?? defaultSettings.partnerTermsContent,
    partnerPrivacyContent: partial.partnerPrivacyContent ?? defaultSettings.partnerPrivacyContent,
  };
}

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
  const response = await api.get<Partial<StoreSettings>>('/settings');
  return mergeSettings(response.data);
});

export const updateSettingsAsync = createAsyncThunk(
  'settings/update',
  async (partial: Partial<StoreSettings>) => {
    const response = await api.put<Partial<StoreSettings>>('/settings', partial);
    return mergeSettings(response.data);
  }
);

const initialState: SettingsState = {
  data: defaultSettings,
  loading: false,
  saving: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(updateSettingsAsync.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateSettingsAsync.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateSettingsAsync.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save settings';
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
