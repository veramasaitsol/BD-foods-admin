import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchSettings, updateSettingsAsync, StoreSettings } from '@/store/slices/settingsSlice';
import { Store, MapPin, CreditCard, Calculator, Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

const paymentLabels: Record<keyof StoreSettings['paymentMethods'], { title: string; description: string }> = {
  card: { title: 'Credit/Debit Cards', description: 'Visa, Mastercard, RuPay' },
  upi: { title: 'UPI Payments', description: 'GPay, PhonePe, Paytm' },
  cod: { title: 'Cash on Delivery', description: 'Pay when you receive' },
  netBanking: { title: 'Net Banking', description: 'All major banks' },
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const { data: settings, loading, saving } = useAppSelector((state) => state.settings);
  const [form, setForm] = useState<StoreSettings>(settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const save = async (partial: Partial<StoreSettings>, successMessage: string) => {
    try {
      await dispatch(updateSettingsAsync(partial)).unwrap();
      toast({ title: 'Saved', description: successMessage });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to save settings'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your store settings
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input id="storeEmail" type="email" value={form.storeEmail} onChange={(e) => setForm({ ...form, storeEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input id="storePhone" value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone2">Alternate Phone</Label>
                  <Input id="storePhone2" value={form.storePhone2 || ''} onChange={(e) => setForm({ ...form, storePhone2: e.target.value })} placeholder="Optional second number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeWebsite">Website</Label>
                  <Input id="storeWebsite" value={form.storeWebsite} onChange={(e) => setForm({ ...form, storeWebsite: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                disabled={saving}
                onClick={() => save({
                  storeName: form.storeName,
                  storeEmail: form.storeEmail,
                  storePhone: form.storePhone,
                  storePhone2: form.storePhone2,
                  storeWebsite: form.storeWebsite,
                  storeAddress: form.storeAddress,
                }, 'Store information updated.')}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>
                Configure delivery areas and charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {form.deliveryZones.zones.map((zone, index) => (
                  <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{zone.label}</p>
                      <p className="text-sm text-muted-foreground">{zone.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <NumberInput
                        className="w-24"
                        value={zone.charge}
                        onChange={(value) => {
                          const zones = [...form.deliveryZones.zones];
                          zones[index] = { ...zone, charge: value ?? 0 };
                          setForm({ ...form, deliveryZones: { ...form.deliveryZones, zones } });
                        }}
                        min={0}
                      />
                      <Switch
                        checked={zone.enabled}
                        onCheckedChange={(checked) => {
                          const zones = [...form.deliveryZones.zones];
                          zones[index] = { ...zone, enabled: checked };
                          setForm({ ...form, deliveryZones: { ...form.deliveryZones, zones } });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Delivery Threshold</p>
                  <p className="text-sm text-muted-foreground">
                    Orders above this amount get free delivery
                  </p>
                </div>
                <NumberInput
                  className="w-32"
                  value={form.deliveryZones.freeDeliveryThreshold}
                  onChange={(value) => setForm({
                    ...form,
                    deliveryZones: { ...form.deliveryZones, freeDeliveryThreshold: value ?? 0 },
                  })}
                  min={0}
                />
              </div>
              <Button disabled={saving} onClick={() => save({ deliveryZones: form.deliveryZones }, 'Delivery settings updated.')}>
                Save Delivery Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Configure accepted payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(paymentLabels) as Array<keyof StoreSettings['paymentMethods']>).map((key) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{paymentLabels[key].title}</p>
                      <p className="text-sm text-muted-foreground">{paymentLabels[key].description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.paymentMethods[key]}
                    onCheckedChange={(checked) => setForm({
                      ...form,
                      paymentMethods: { ...form.paymentMethods, [key]: checked },
                    })}
                  />
                </div>
              ))}
              <Button disabled={saving} onClick={() => save({ paymentMethods: form.paymentMethods }, 'Payment settings updated.')}>
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Configuration
              </CardTitle>
              <CardDescription>
                Configure GST and tax settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={form.tax.gstNumber}
                    onChange={(e) => setForm({ ...form, tax: { ...form.tax, gstNumber: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={form.tax.panNumber}
                    onChange={(e) => setForm({ ...form, tax: { ...form.tax, panNumber: e.target.value } })}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Tax Rates by Category</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {form.tax.categoryRates.map((rate, index) => (
                    <div key={rate.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <span>{rate.category}</span>
                      <NumberInput
                        className="w-20"
                        value={rate.rate}
                        onChange={(value) => {
                          const categoryRates = [...form.tax.categoryRates];
                          categoryRates[index] = { ...rate, rate: value ?? 0 };
                          setForm({ ...form, tax: { ...form.tax, categoryRates } });
                        }}
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button disabled={saving} onClick={() => save({ tax: form.tax }, 'Tax settings updated.')}>
                Save Tax Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal / Info Pages */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Legal &amp; Info Pages
              </CardTitle>
              <CardDescription>
                Edit the About Us, Contact, Terms &amp; Conditions, and Privacy Policy content shown to customers and delivery partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="customer" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="customer">Website (Customer)</TabsTrigger>
                  <TabsTrigger value="partner">Delivery Partner</TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutContent">About Us</Label>
                    <Textarea
                      id="aboutContent"
                      value={form.aboutContent}
                      onChange={(e) => setForm({ ...form, aboutContent: e.target.value })}
                      rows={6}
                      placeholder="Tell customers about your story..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Contact Page Intro</Label>
                    <Textarea
                      id="contactMessage"
                      value={form.contactMessage}
                      onChange={(e) => setForm({ ...form, contactMessage: e.target.value })}
                      rows={3}
                      placeholder="A short welcome message shown above your contact details..."
                    />
                    <p className="text-xs text-muted-foreground">
                      The actual email, phone, and address shown on the Contact page come from the Store tab above.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termsContent">Terms &amp; Conditions</Label>
                    <Textarea
                      id="termsContent"
                      value={form.termsContent}
                      onChange={(e) => setForm({ ...form, termsContent: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacyContent">Privacy Policy</Label>
                    <Textarea
                      id="privacyContent"
                      value={form.privacyContent}
                      onChange={(e) => setForm({ ...form, privacyContent: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <Button
                    disabled={saving}
                    onClick={() => save({
                      aboutContent: form.aboutContent,
                      contactMessage: form.contactMessage,
                      termsContent: form.termsContent,
                      privacyContent: form.privacyContent,
                    }, 'Website pages updated.')}
                  >
                    Save Website Pages
                  </Button>
                </TabsContent>

                <TabsContent value="partner" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="partnerAboutContent">About Us</Label>
                    <Textarea
                      id="partnerAboutContent"
                      value={form.partnerAboutContent}
                      onChange={(e) => setForm({ ...form, partnerAboutContent: e.target.value })}
                      rows={6}
                      placeholder="Tell delivery partners about your story..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerContactMessage">Contact Page Intro</Label>
                    <Textarea
                      id="partnerContactMessage"
                      value={form.partnerContactMessage}
                      onChange={(e) => setForm({ ...form, partnerContactMessage: e.target.value })}
                      rows={3}
                      placeholder="A short welcome message shown above your partner support contact details..."
                    />
                    <p className="text-xs text-muted-foreground">
                      The actual email, phone, and address shown on the Contact page come from the Store tab above.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerTermsContent">Terms &amp; Conditions</Label>
                    <Textarea
                      id="partnerTermsContent"
                      value={form.partnerTermsContent}
                      onChange={(e) => setForm({ ...form, partnerTermsContent: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerPrivacyContent">Privacy Policy</Label>
                    <Textarea
                      id="partnerPrivacyContent"
                      value={form.partnerPrivacyContent}
                      onChange={(e) => setForm({ ...form, partnerPrivacyContent: e.target.value })}
                      rows={10}
                    />
                  </div>
                  <Button
                    disabled={saving}
                    onClick={() => save({
                      partnerAboutContent: form.partnerAboutContent,
                      partnerContactMessage: form.partnerContactMessage,
                      partnerTermsContent: form.partnerTermsContent,
                      partnerPrivacyContent: form.partnerPrivacyContent,
                    }, 'Delivery partner pages updated.')}
                  >
                    Save Delivery Partner Pages
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
