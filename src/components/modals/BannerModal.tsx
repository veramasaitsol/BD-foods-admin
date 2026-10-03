import { useState, useEffect } from 'react';
import { Banner, BannerInput, BannerLinkType } from '@/store/slices/bannersSlice';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

interface BannerModalProps {
  open: boolean;
  onClose: () => void;
  banner: Banner | null;
  mode: 'edit' | 'add';
  onSave: (input: BannerInput) => void;
}

const emptyForm = {
  title: '',
  subtitle: '',
  description: '',
  buttonText: '',
  linkType: 'none' as BannerLinkType,
  productId: undefined as string | undefined,
  categoryId: undefined as string | undefined,
  externalUrl: '',
  sortOrder: 0,
  status: 'active' as 'active' | 'inactive',
  startDate: '',
  endDate: '',
};

const BannerModal = ({ open, onClose, banner, mode, onSave }: BannerModalProps) => {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (products.length === 0) dispatch(fetchProducts());
      if (categories.length === 0) dispatch(fetchCategories());
    }
  }, [open, dispatch, products.length, categories.length]);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        buttonText: banner.buttonText || '',
        linkType: banner.linkType,
        productId: banner.productId ?? undefined,
        categoryId: banner.categoryId ?? undefined,
        externalUrl: banner.externalUrl || '',
        sortOrder: banner.sortOrder,
        status: banner.status,
        startDate: banner.startDate ? banner.startDate.slice(0, 10) : '',
        endDate: banner.endDate ? banner.endDate.slice(0, 10) : '',
      });
      setImagePreview(banner.image);
    } else {
      setFormData(emptyForm);
      setImagePreview('');
    }
    setImageFile(null);
  }, [banner, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      buttonText: formData.buttonText,
      linkType: formData.linkType,
      productId: formData.linkType === 'product' ? formData.productId ?? null : null,
      categoryId: formData.linkType === 'category' ? formData.categoryId ?? null : null,
      externalUrl: formData.linkType === 'url' ? formData.externalUrl : '',
      sortOrder: formData.sortOrder,
      status: formData.status,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      image: imageFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Add Banner' : 'Edit Banner'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Banner Image {mode === 'add' && '*'}</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-[3/1] object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => { setImageFile(null); setImagePreview(''); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="banner-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="banner-image" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Click to upload banner image</span>
                </label>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended: 1200×400px or wider (3:1 ratio). Minimum: 400×200px. Works on all screen sizes — the image auto-scales to fit.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., From Farm to Kitchen"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="e.g., Shop Now"
              />
            </div>
            <div className="space-y-2">
              <Label>Links To</Label>
              <Select
                value={formData.linkType}
                onValueChange={(value: BannerLinkType) => setFormData({ ...formData, linkType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nothing (decorative)</SelectItem>
                  <SelectItem value="product">A Product</SelectItem>
                  <SelectItem value="category">A Category</SelectItem>
                  <SelectItem value="url">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.linkType === 'product' && (
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select
                value={formData.productId !== undefined ? String(formData.productId) : undefined}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.linkType === 'category' && (
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.categoryId !== undefined ? String(formData.categoryId) : undefined}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.linkType === 'url' && (
            <div className="space-y-2">
              <Label>External URL *</Label>
              <Input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://example.com/sale"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <NumberInput
                value={formData.sortOrder}
                onChange={(value) => setFormData({ ...formData, sortOrder: value ?? 0 })}
                allowDecimal={false}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Leave dates blank to show indefinitely (only "Status" governs visibility).
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Banner' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BannerModal;
