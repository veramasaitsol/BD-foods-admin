import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  Banner,
  BannerInput,
} from '@/store/slices/bannersSlice';
import { Image as ImageIcon, Plus, Edit, Trash2, Link2, Loader2 } from 'lucide-react';
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
import BannerModal from '@/components/modals/BannerModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const describeLink = (banner: Banner) => {
  switch (banner.linkType) {
    case 'product':
      return banner.product ? `Product: ${banner.product.name}` : 'Product (deleted)';
    case 'category':
      return banner.category ? `Category: ${banner.category.name}` : 'Category (deleted)';
    case 'url':
      return banner.externalUrl || 'External URL';
    default:
      return 'Not linked';
  }
};

const Banners = () => {
  const dispatch = useAppDispatch();
  const { items: banners, loading } = useAppSelector((state) => state.banners);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
  const paginatedBanners = banners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (mode: 'edit' | 'add', banner: Banner | null = null) => {
    setModalMode(mode);
    setSelectedBanner(banner);
    setModalOpen(true);
  };

  const handleSave = async (input: BannerInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createBanner(input)).unwrap();
        toast({ title: 'Banner created', description: 'New banner has been added.' });
      } else if (selectedBanner) {
        await dispatch(updateBanner({ id: selectedBanner.id, input })).unwrap();
        toast({ title: 'Banner updated', description: 'Banner has been updated.' });
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

  const handleToggleStatus = (banner: Banner) => {
    dispatch(toggleBannerStatus(banner));
  };

  const handleDeleteClick = (id: string) => {
    setBannerToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bannerToDelete) {
      try {
        await dispatch(deleteBanner(bannerToDelete)).unwrap();
        toast({ title: 'Banner deleted', description: 'The banner has been removed.', variant: 'destructive' });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete banner'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setBannerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage homepage hero banners and their links</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && banners.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
              <p className="text-muted-foreground mb-4">Add a banner to feature it on the homepage</p>
              <Button onClick={() => handleOpenModal('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Banner</TableHead>
                  <TableHead>Links To</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBanners.map((banner) => (
                  <TableRow key={banner.id} className="table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-12 w-24 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.subtitle && (
                            <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        {describeLink(banner)}
                      </Badge>
                    </TableCell>
                    <TableCell>{banner.sortOrder}</TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(banner)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal('edit', banner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(banner.id)}
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
            totalItems={banners.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="banners"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <BannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        banner={selectedBanner}
        mode={modalMode}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
      />
    </div>
  );
};

export default Banners;
