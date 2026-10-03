import { useState, useEffect } from 'react';
import { DeliveryPartner, DeliveryPartnerInput } from '@/store/slices/deliveryPartnersSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DeliveryPartnerModalProps {
  open: boolean;
  onClose: () => void;
  partner: DeliveryPartner | null;
  mode: 'edit' | 'add';
  onSave: (input: DeliveryPartnerInput) => void;
}

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'auto', label: 'Auto Rickshaw' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
];

// Standard Indian vehicle registration format, e.g. TS09AB1234 or KA01A1234.
const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm: DeliveryPartnerInput = { name: '', email: '', password: '', phone: '', vehicleType: '', vehicleNumber: '' };

type FormErrors = Partial<Record<keyof DeliveryPartnerInput, string>>;

const DeliveryPartnerModal = ({ open, onClose, partner, mode, onSave }: DeliveryPartnerModalProps) => {
  const [formData, setFormData] = useState<DeliveryPartnerInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        email: partner.email,
        password: '',
        phone: partner.phone || '',
        vehicleType: partner.vehicleType || '',
        vehicleNumber: partner.vehicleNumber || '',
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [partner, open]);

  const validate = (data: DeliveryPartnerInput): FormErrors => {
    const next: FormErrors = {};

    if (!data.name.trim()) {
      next.name = 'Name is required';
    }

    if (!data.email.trim()) {
      next.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      next.email = 'Enter a valid email address';
    }

    if (mode === 'add') {
      if (!data.password) {
        next.password = 'Password is required';
      } else if (data.password.length < 6) {
        next.password = 'Password must be at least 6 characters';
      }
    }

    if (!data.phone?.trim()) {
      next.phone = 'Phone number is required';
    } else if (!PHONE_REGEX.test(data.phone.trim())) {
      next.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!data.vehicleType?.trim()) {
      next.vehicleType = 'Select a vehicle type';
    }

    if (!data.vehicleNumber?.trim()) {
      next.vehicleNumber = 'Vehicle number is required';
    } else if (!VEHICLE_NUMBER_REGEX.test(data.vehicleNumber.trim().toUpperCase())) {
      next.vehicleNumber = 'Enter a valid vehicle number (e.g. TS09AB1234)';
    }

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave({ ...formData, vehicleNumber: formData.vehicleNumber?.trim().toUpperCase() });
  };

  const clearError = (field: keyof DeliveryPartnerInput) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Add Delivery Partner' : 'Edit Delivery Partner'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                clearError('name');
              }}
              className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                clearError('email');
              }}
              disabled={mode === 'edit'}
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          {mode === 'add' && (
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  clearError('password');
                }}
                className={cn(errors.password && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 10) });
                clearError('phone');
              }}
              placeholder="9876543210"
              inputMode="numeric"
              className={cn(errors.phone && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={formData.vehicleType || undefined}
                onValueChange={(value) => {
                  setFormData({ ...formData, vehicleType: value });
                  clearError('vehicleType');
                }}
              >
                <SelectTrigger className={cn(errors.vehicleType && 'border-destructive focus-visible:ring-destructive')}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleType && <p className="text-sm text-destructive">{errors.vehicleType}</p>}
            </div>
            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input
                value={formData.vehicleNumber}
                onChange={(e) => {
                  setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() });
                  clearError('vehicleNumber');
                }}
                placeholder="TS09AB1234"
                className={cn('uppercase', errors.vehicleNumber && 'border-destructive focus-visible:ring-destructive')}
              />
              {errors.vehicleNumber && <p className="text-sm text-destructive">{errors.vehicleNumber}</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Partner' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryPartnerModal;
