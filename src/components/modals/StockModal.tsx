import { useState, useEffect } from 'react';
import { Product } from '@/store/slices/productsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface StockModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (id: string, stock: number) => void;
}

const StockModal = ({ open, onClose, product, onUpdate }: StockModalProps) => {
  const [newStock, setNewStock] = useState(product?.stock || 0);

  useEffect(() => {
    setNewStock(product?.stock || 0);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onUpdate(product.id, newStock);
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Update Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-medium">{product.name}</p>
              <Badge variant="secondary">{product.category?.name || 'Uncategorized'}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Current Stock: {product.stock} units</Label>
            <NumberInput
              value={newStock}
              onChange={(value) => setNewStock(value ?? 0)}
              allowDecimal={false}
              min={0}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Stock</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockModal;
