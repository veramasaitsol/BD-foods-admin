import { useState, useEffect } from 'react';
import { GalleryItem, GalleryItemInput } from '@/store/slices/gallerySlice';
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
import { Upload, X, Image, Video } from 'lucide-react';

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  mode: 'edit' | 'add';
  onSave: (input: GalleryItemInput) => void;
}

const emptyForm = {
  title: '',
  description: '',
  mediaType: 'photo' as 'photo' | 'video',
  sortOrder: 0,
  status: 'active' as 'active' | 'inactive',
};

const GalleryModal = ({ open, onClose, item, mode, onSave }: GalleryModalProps) => {
  const [formData, setFormData] = useState(emptyForm);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        mediaType: item.mediaType,
        sortOrder: item.sortOrder,
        status: item.status,
      });
      setMediaPreview(item.mediaUrl);
    } else {
      setFormData(emptyForm);
      setMediaPreview('');
    }
    setMediaFile(null);
  }, [item, open]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);

    if (file.type.startsWith('video/')) {
      // For videos, create a blob URL for preview
      setMediaPreview(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      mediaType: formData.mediaType,
      sortOrder: formData.sortOrder,
      status: formData.status,
      media: mediaFile,
    });
  };

  const isVideo = formData.mediaType === 'video';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Add Gallery Item' : 'Edit Gallery Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Media {mode === 'add' && '*'}</Label>
            {mediaPreview ? (
              <div className="relative">
                {isVideo ? (
                  <video
                    src={mediaPreview}
                    className="w-full aspect-video object-cover rounded-lg border"
                    controls
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="gallery-media"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                />
                <label htmlFor="gallery-media" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Click to upload photo or video</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Images: JPEG, PNG, WebP, GIF | Videos: MP4, WebM, OGG, MOV (max 50MB)
                  </span>
                </label>
              </div>
            )}
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
              <Label>Media Type *</Label>
              <Select
                value={formData.mediaType}
                onValueChange={(value: 'photo' | 'video') => setFormData({ ...formData, mediaType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">
                    <span className="flex items-center gap-2">
                      <Image className="h-4 w-4" /> Photo
                    </span>
                  </SelectItem>
                  <SelectItem value="video">
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Video
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Optional description for this gallery item"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Item' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;
