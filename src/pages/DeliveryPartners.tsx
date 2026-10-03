import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchDeliveryPartners,
  createDeliveryPartnerAsync,
  updateDeliveryPartnerAsync,
  toggleDeliveryPartnerStatusAsync,
  deleteDeliveryPartnerAsync,
  DeliveryPartner,
  DeliveryPartnerInput,
} from '@/store/slices/deliveryPartnersSlice';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { Bike, Plus, Edit, Trash2, Loader2, CircleDot, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Pagination from '@/components/common/Pagination';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';
import DeliveryPartnerModal from '@/components/modals/DeliveryPartnerModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const formatStatusLabel = (status: string) =>
  status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const DeliveryPartners = () => {
  const dispatch = useAppDispatch();
  const { items: partners, loading } = useAppSelector((state) => state.deliveryPartners);
  const { items: orders } = useAppSelector((state) => state.orders);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [viewOrdersPartner, setViewOrdersPartner] = useState<DeliveryPartner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDeliveryPartners());
    dispatch(fetchOrders());
  }, [dispatch]);

  const totalPages = Math.ceil(partners.length / ITEMS_PER_PAGE);
  const paginatedPartners = partners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const partnerOrders = useMemo(
    () => orders.filter((o) => o.deliveryPartnerId === viewOrdersPartner?.id),
    [orders, viewOrdersPartner],
  );

  const handleOpenModal = (mode: 'edit' | 'add', partner: DeliveryPartner | null = null) => {
    setModalMode(mode);
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  const handleSave = async (input: DeliveryPartnerInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createDeliveryPartnerAsync(input)).unwrap();
        toast({ title: 'Delivery partner added', description: 'New delivery partner has been created.' });
      } else if (selectedPartner) {
        await dispatch(updateDeliveryPartnerAsync({
          id: selectedPartner.id,
          input: { name: input.name, phone: input.phone, vehicleType: input.vehicleType, vehicleNumber: input.vehicleNumber },
        })).unwrap();
        toast({ title: 'Delivery partner updated' });
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

  const handleToggleStatus = async (partner: DeliveryPartner) => {
    try {
      await dispatch(toggleDeliveryPartnerStatusAsync(partner)).unwrap();
      toast({ title: 'Status updated', description: `${partner.name}'s access has been updated.` });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update status'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setPartnerToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (partnerToDelete) {
      try {
        await dispatch(deleteDeliveryPartnerAsync(partnerToDelete)).unwrap();
        toast({ title: 'Delivery partner removed', variant: 'destructive' });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to remove delivery partner'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setPartnerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Delivery Partners
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage riders and assign them to orders
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add Delivery Partner
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Partners</p>
              <h3 className="text-2xl font-bold">{partners.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CircleDot className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Duty</p>
              <h3 className="text-2xl font-bold">{partners.filter((p) => p.isOnDuty).length}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CircleDot className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Now</p>
              <h3 className="text-2xl font-bold">{partners.filter((p) => p.availability === 'available').length}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Bike className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Accounts</p>
              <h3 className="text-2xl font-bold">{partners.filter((p) => p.status === 'active').length}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All Delivery Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && partners.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No delivery partners yet. Add one to start assigning deliveries.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Partner</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Duty</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPartners.map((partner) => (
                  <TableRow key={partner.id} className="table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {partner.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-muted-foreground">{partner.email}</p>
                          {partner.phone && <p className="text-sm text-muted-foreground">{partner.phone}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {partner.vehicleType ? (
                        <div>
                          <p className="font-medium capitalize">{partner.vehicleType}</p>
                          {partner.vehicleNumber && (
                            <p className="text-sm text-muted-foreground">{partner.vehicleNumber}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={partner.isOnDuty ? 'default' : 'secondary'}>
                        {partner.isOnDuty ? 'On Duty' : 'Off Duty'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          partner.availability === 'available'
                            ? 'default'
                            : partner.availability === 'busy'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {partner.availability === 'available'
                          ? 'Available'
                          : partner.availability === 'busy'
                          ? 'Busy'
                          : 'Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={partner.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(partner)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View orders"
                          onClick={() => setViewOrdersPartner(partner)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal('edit', partner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(partner.id)}
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
            totalItems={partners.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="delivery partners"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <DeliveryPartnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={selectedPartner}
        mode={modalMode}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Delivery Partner"
        description="Are you sure you want to remove this delivery partner? This action cannot be undone."
      />

      <Dialog open={!!viewOrdersPartner} onOpenChange={(open) => !open && setViewOrdersPartner(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Orders for {viewOrdersPartner?.name}
            </DialogTitle>
          </DialogHeader>
          {partnerOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders assigned to this partner yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerOrders.map((order) => (
                  <TableRow key={order.id} className="table-row">
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'default'
                            : order.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {formatStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryPartners;
