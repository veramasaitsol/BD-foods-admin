import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  createCouponAsync,
  updateCouponAsync,
  deleteCouponAsync,
  toggleCouponStatusAsync,
  fetchCoupons,
  Coupon,
  CouponInput,
} from '@/store/slices/promotionsSlice';
import { Tag, Plus, Edit, Trash2, Calendar, Percent, IndianRupee } from 'lucide-react';
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
import CouponModal from '@/components/modals/CouponModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const Promotions = () => {
  const dispatch = useAppDispatch();
  const { items: coupons } = useAppSelector((state) => state.promotions);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const totalPages = Math.ceil(coupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = coupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (mode: 'edit' | 'add', coupon: Coupon | null = null) => {
    setModalMode(mode);
    setSelectedCoupon(coupon);
    setModalOpen(true);
  };

  const handleSaveCoupon = async (input: CouponInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createCouponAsync(input)).unwrap();
        toast({ title: 'Coupon created', description: 'New coupon has been created.' });
      } else if (selectedCoupon) {
        await dispatch(updateCouponAsync({ id: selectedCoupon.id, input })).unwrap();
        toast({ title: 'Coupon updated', description: 'Coupon has been updated.' });
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

  const handleToggleStatus = (coupon: Coupon) => {
    dispatch(toggleCouponStatusAsync(coupon));
    toast({
      title: 'Status updated',
      description: 'Coupon status has been changed.',
    });
  };

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (couponToDelete) {
      try {
        await dispatch(deleteCouponAsync(couponToDelete)).unwrap();
        toast({
          title: 'Coupon deleted',
          description: 'The coupon has been removed.',
          variant: 'destructive',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete coupon'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Promotions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage coupons and discounts
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Coupons</p>
              <h3 className="text-2xl font-bold">
                {coupons.filter((c) => c.status === 'active').length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Percent className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <h3 className="text-2xl font-bold">
                {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Savings Given</p>
              <h3 className="text-2xl font-bold">₹24,500</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="table-row">
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded font-medium">
                      {coupon.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {coupon.type === 'percentage' ? (
                        <>{coupon.value}% off</>
                      ) : (
                        <>₹{coupon.value} off</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{coupon.minOrder}</TableCell>
                  <TableCell>{coupon.usageCount} times</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : 'No expiry'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(coupon)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOpenModal('edit', coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteClick(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={coupons.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="coupons"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CouponModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={selectedCoupon}
        mode={modalMode}
        onSave={handleSaveCoupon}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
      />
    </div>
  );
};

export default Promotions;
