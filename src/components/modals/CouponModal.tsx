import { useState, useEffect } from 'react';
import { Coupon, CouponInput } from '@/store/slices/promotionsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  mode: 'edit' | 'add';
  onSave: (input: CouponInput) => void;
}

const emptyForm: CouponInput = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrder: 0,
  maxDiscount: null,
  expiresAt: '',
};

const CouponModal = ({ open, onClose, coupon, mode, onSave }: CouponModalProps) => {
  const [formData, setFormData] = useState<CouponInput>(emptyForm);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [coupon, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Create Coupon' : 'Edit Coupon'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SAVE20"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}</Label>
              <NumberInput
                value={formData.value}
                onChange={(value) => setFormData({ ...formData, value: value ?? 0 })}
                min={0}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Order (₹)</Label>
              <NumberInput
                value={formData.minOrder}
                onChange={(value) => setFormData({ ...formData, minOrder: value ?? 0 })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Discount (₹)</Label>
              <NumberInput
                value={formData.maxDiscount ?? undefined}
                onChange={(value) => setFormData({ ...formData, maxDiscount: value ?? null })}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={formData.expiresAt ?? ''}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Coupon' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
