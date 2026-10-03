import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemStatus,
  GalleryItem,
  GalleryItemInput,
} from '@/store/slices/gallerySlice';
import { Image as ImageIcon, Plus, Edit, Trash2, Loader2, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/common/Pagination';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import GalleryModal from '@/components/modals/GalleryModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const Gallery = () => {
  const dispatch = useAppDispatch();
  const { items: galleryItems, loading } = useAppSelector((state) => state.gallery);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchGalleryItems());
  }, [dispatch]);

  const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
  const paginatedItems = galleryItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (mode: 'edit' | 'add', item: GalleryItem | null = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleSave = async (input: GalleryItemInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createGalleryItem(input)).unwrap();
        toast({ title: 'Gallery item created', description: 'New item has been added.' });
      } else if (selectedItem) {
        await dispatch(updateGalleryItem({ id: selectedItem.id, input })).unwrap();
        toast({ title: 'Gallery item updated', description: 'Item has been updated.' });
      }
      setModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Something went wrong'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = (item: GalleryItem) => {
    dispatch(toggleGalleryItemStatus(item));
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteGalleryItem(itemToDelete)).unwrap();
        toast({ title: 'Gallery item deleted', description: 'The item has been removed.', variant: 'destructive' });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete gallery item'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Gallery</h1>
          <p className="text-muted-foreground mt-1">Manage photos and videos for the website gallery</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Gallery Items ({galleryItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && galleryItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No gallery items yet</h3>
              <p className="text-muted-foreground mb-4">Add photos and videos to display on the website</p>
              <Button onClick={() => handleOpenModal('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Media</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} className="table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.mediaType === 'video' ? (
                          <div className="h-12 w-24 rounded-lg bg-muted flex items-center justify-center border relative overflow-hidden">
                            <video src={item.mediaUrl} className="h-full w-full object-cover" muted />
                            <Video className="absolute h-5 w-5 text-white drop-shadow-lg" />
                          </div>
                        ) : (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="h-12 w-24 rounded-lg object-cover border"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.mediaType === 'video' ? 'default' : 'secondary'} className="gap-1">
                        {item.mediaType === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                        {item.mediaType === 'video' ? 'Video' : 'Photo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(item)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal('edit', item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={galleryItems.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="gallery items"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <GalleryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        mode={modalMode}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery item? This action cannot be undone."
      />
    </div>
  );
};

export default Gallery;
