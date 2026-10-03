import { useState, useEffect } from 'react';
import { Product, ProductInput, ProductVariant, deleteProductImage, reorderProductImages } from '@/store/slices/productsSlice';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
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
import { Upload, X, Loader2, ChevronLeft, ChevronRight, Plus, Trash2, Star, Flame } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  mode: 'view' | 'edit' | 'add';
  onSave: (input: ProductInput) => void;
}

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  discountedPrice: undefined as number | undefined,
  weight: '',
  categoryId: undefined as string | undefined,
  stock: 0,
  status: 'active' as 'active' | 'inactive',
  isBestSeller: false,
  isFeatured: false,
  variants: [] as ProductVariant[],
};

const MAX_IMAGES = 6;

const ProductModal = ({ open, onClose, product, mode, onSave }: ProductModalProps) => {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const [formData, setFormData] = useState(emptyForm);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discountedPrice: product.discountedPrice ?? undefined,
        weight: product.weight || '',
        categoryId: product.categoryId ?? undefined,
        stock: product.stock,
        status: product.status,
        isBestSeller: product.isBestSeller,
        isFeatured: product.isFeatured,
        variants: product.variants || [],
      });
    } else {
      setFormData(emptyForm);
    }
    setExistingImages(product?.images || []);
    setNewImages([]);
  }, [product, open]);

  const totalImageCount = existingImages.length + newImages.length;

  const persistExistingOrder = async (nextOrder: string[]) => {
    if (!product) return;
    setReordering(true);
    try {
      await dispatch(reorderProductImages({ id: product.id, imageUrls: nextOrder })).unwrap();
    } catch (error) {
      setExistingImages(existingImages);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to reorder images'),
        variant: 'destructive',
      });
    } finally {
      setReordering(false);
    }
  };

  const handleMoveExistingImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= existingImages.length) return;
    const next = move(existingImages, index, target);
    setExistingImages(next);
    persistExistingOrder(next);
  };

  const handleMoveNewImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    setNewImages((prev) => move(prev, index, target));
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const remaining = Math.max(0, MAX_IMAGES - totalImageCount);
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast({ title: 'Image limit reached', description: `A product can have up to ${MAX_IMAGES} images.`, variant: 'destructive' });
    }
    setNewImages((prev) => [...prev, ...selected]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    if (!product) return;
    setRemovingImage(imageUrl);
    try {
      await dispatch(deleteProductImage({ id: product.id, imageUrl })).unwrap();
      setExistingImages((prev) => prev.filter((url) => url !== imageUrl));
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to remove image'),
        variant: 'destructive',
      });
    } finally {
      setRemovingImage(null);
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, { label: '', price: 0, stock: 0 }] }));
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      discountedPrice: formData.discountedPrice ?? null,
      weight: formData.weight,
      categoryId: formData.categoryId ?? null,
      stock: formData.stock,
      status: formData.status,
      isBestSeller: formData.isBestSeller,
      isFeatured: formData.isFeatured,
      variants: formData.variants.filter((variant) => variant.label.trim().length > 0),
      images: newImages,
    });
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Add Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.categoryId !== undefined ? String(formData.categoryId) : undefined}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isViewMode}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <NumberInput
                value={formData.price}
                onChange={(value) => setFormData({ ...formData, price: value ?? 0 })}
                disabled={isViewMode}
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Discounted Price</Label>
              <NumberInput
                value={formData.discountedPrice}
                onChange={(value) => setFormData({ ...formData, discountedPrice: value })}
                disabled={isViewMode}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                disabled={isViewMode}
                placeholder="e.g., 500g"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock</Label>
              <NumberInput
                value={formData.stock}
                onChange={(value) => setFormData({ ...formData, stock: value ?? 0 })}
                allowDecimal={false}
                disabled={isViewMode}
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                disabled={isViewMode}
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
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={formData.isBestSeller}
                onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                disabled={isViewMode}
              />
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <Label className="cursor-pointer">Best Seller</Label>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                disabled={isViewMode}
              />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Label className="cursor-pointer">Featured</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variants (optional)</Label>
              {!isViewMode && (
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-3 w-3 mr-1" /> Add Variant
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Add packing options like 100g, 500g or 1kg — each with its own price and stock. Leave empty to sell only
              at the single price/stock set above.
            </p>
            {formData.variants.length > 0 && (
              <div className="space-y-2">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                    <div className="space-y-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Label</Label>}
                      <Input
                        value={variant.label}
                        onChange={(e) => updateVariant(index, { label: e.target.value })}
                        placeholder="e.g., 500g"
                        disabled={isViewMode}
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Price (₹)</Label>}
                      <NumberInput
                        value={variant.price}
                        onChange={(value) => updateVariant(index, { price: value ?? 0 })}
                        disabled={isViewMode}
                        min={0}
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && <Label className="text-xs text-muted-foreground">Stock</Label>}
                      <NumberInput
                        value={variant.stock}
                        onChange={(value) => updateVariant(index, { stock: value ?? 0 })}
                        allowDecimal={false}
                        disabled={isViewMode}
                        min={0}
                      />
                    </div>
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Product Images {!isViewMode && `(${totalImageCount}/${MAX_IMAGES})`}</Label>
            {!isViewMode && totalImageCount > 1 && (
              <p className="text-xs text-muted-foreground">
                The first image is used as the product's cover photo everywhere else in the app. Use the arrows to reorder.
              </p>
            )}

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((url, index) => (
                  <div key={url} className="relative group">
                    <img src={url} alt={formData.name} className="h-20 w-20 rounded-lg object-cover border" />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-medium leading-none">
                        Cover
                      </span>
                    )}
                    {!isViewMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          disabled={removingImage === url || reordering}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                        >
                          {removingImage === url ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                        </button>
                        <div className="absolute inset-x-0 top-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleMoveExistingImage(index, -1)}
                            disabled={index === 0 || reordering}
                            className="h-5 w-5 rounded-full bg-background/90 border flex items-center justify-center disabled:opacity-30"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExistingImage(index, 1)}
                            disabled={index === existingImages.length - 1 || reordering}
                            className="h-5 w-5 rounded-full bg-background/90 border flex items-center justify-center disabled:opacity-30"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {newImages.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-20 w-20 rounded-lg object-cover border border-dashed border-primary" />
                    {existingImages.length === 0 && index === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-medium leading-none">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute inset-x-0 top-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveNewImage(index, -1)}
                        disabled={index === 0}
                        className="h-5 w-5 rounded-full bg-background/90 border flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveNewImage(index, 1)}
                        disabled={index === newImages.length - 1}
                        className="h-5 w-5 rounded-full bg-background/90 border flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isViewMode && totalImageCount < MAX_IMAGES && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="product-images"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                  }}
                />
                <label htmlFor="product-images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm font-medium">Click to add images</span>
                  <span className="text-xs text-muted-foreground">Up to {MAX_IMAGES} images, PNG/JPG</span>
                </label>
              </div>
            )}
          </div>

          {!isViewMode && (
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
