import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setStatusFilter,
  setSearchQuery,
  updateOrderStatusAsync,
  assignDeliveryPartnerAsync,
  fetchOrders,
  type Order,
  type OrderStatus,
} from '@/store/slices/ordersSlice';
import { fetchDeliveryPartners, type DeliveryPartner } from '@/store/slices/deliveryPartnersSlice';
import { Search, Filter, Eye, Truck, Download, Loader2, Bike, Ban, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';

const statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CANCELLABLE_STATUSES: OrderStatus[] = ['placed', 'assigned'];

const getStatusBadgeClass = (status: string) => {
  const styles: Record<string, string> = {
    placed: 'status-badge status-pending',
    assigned: 'status-badge status-processing',
    out_for_delivery: 'status-badge status-shipped',
    delivered: 'status-badge status-delivered',
    cancelled: 'status-badge status-cancelled',
  };
  return styles[status] || 'status-badge';
};

const formatStatusLabel = (status: string) =>
  status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const availabilityLabel = (partner: DeliveryPartner) =>
  partner.availability === 'offline' ? 'Offline' : partner.availability === 'busy' ? 'Busy' : 'Available';

interface OrderRowProps {
  order: Order;
  activeDeliveryPartners: DeliveryPartner[];
  onAssignPartner: (id: string, deliveryPartnerId: string) => void;
  onCancelOrder: (id: string) => void;
}

const OrderRow = ({ order, activeDeliveryPartners, onAssignPartner, onCancelOrder }: OrderRowProps) => {
  const [cancelOpen, setCancelOpen] = useState(false);
  const isCancellable = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <TableRow key={order.id} className="table-row">
      <TableCell className="font-medium">{order.orderNumber}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{order.customer?.name || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">
            {order.customer?.phone || '—'}
          </p>
        </div>
      </TableCell>
      <TableCell>{order.items.length} items</TableCell>
      <TableCell className="font-medium">₹{order.total}</TableCell>
      <TableCell>
        <span className={getStatusBadgeClass(order.status)}>
          {formatStatusLabel(order.status)}
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={
            order.paymentStatus === 'paid'
              ? 'default'
              : order.paymentStatus === 'pending'
              ? 'secondary'
              : 'destructive'
          }
        >
          {order.paymentStatus}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Order {order.orderNumber}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">
                      Customer Details
                    </h4>
                    <p>{order.customer?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''},{' '}
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.weight} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 font-medium text-lg">
                    <span >Sub Total</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                   <div className="flex justify-between items-center pt-2 font-medium text-lg">
                    <span >Delivery Charges</span>
                    <span>₹{order.deliveryCharge}</span>
                  </div>
                   <div className="flex justify-between items-center pt-2 border-t mt-2 font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex items-center justify-between gap-3">
                    <span className={getStatusBadgeClass(order.status)}>
                      {formatStatusLabel(order.status)}
                    </span>
                    {isCancellable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setCancelOpen(true)}
                      >
                        <Ban className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Status advances automatically as the order is assigned and delivered.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Delivery Partner
                  </h4>
                  <Select
                    value={order.deliveryPartnerId ?? undefined}
                    onValueChange={(value) => onAssignPartner(order.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Not assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDeliveryPartners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}{partner.vehicleType ? ` (${partner.vehicleType})` : ''} — {availabilityLabel(partner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {order.deliveryPartner?.phone && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {order.deliveryPartner.phone}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
      <DeleteConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          onCancelOrder(order.id);
          setCancelOpen(false);
        }}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${order.orderNumber}? This will restock its items.`}
        confirmText="Cancel Order"
      />
    </TableRow>
  );
};

const OrdersTable = ({
  orders,
  activeDeliveryPartners,
  onAssignPartner,
  onCancelOrder,
}: {
  orders: Order[];
  activeDeliveryPartners: DeliveryPartner[];
  onAssignPartner: (id: string, deliveryPartnerId: string) => void;
  onCancelOrder: (id: string) => void;
}) => (
  <div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow className="table-header">
        <TableHead>Order ID</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Items</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Payment</TableHead>
        <TableHead>Date</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          activeDeliveryPartners={activeDeliveryPartners}
          onAssignPartner={onAssignPartner}
          onCancelOrder={onCancelOrder}
        />
      ))}
    </TableBody>
  </Table>
  </div>
);

const Orders = () => {
  const dispatch = useAppDispatch();
  const { items: orders, loading, statusFilter, searchQuery } = useAppSelector(
    (state) => state.orders
  );
  const { items: deliveryPartners } = useAppSelector((state) => state.deliveryPartners);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchDeliveryPartners());
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAssignPartner = async (id: string, deliveryPartnerId: string) => {
    try {
      await dispatch(assignDeliveryPartnerAsync({ id, deliveryPartnerId })).unwrap();
      toast({
        title: 'Delivery partner assigned',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to assign delivery partner'),
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await dispatch(updateOrderStatusAsync({ id, status: 'cancelled' })).unwrap();
      toast({ title: 'Order cancelled' });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to cancel order'),
        variant: 'destructive',
      });
    }
  };

  const orderStats = {
    placed: orders.filter((o) => o.status === 'placed').length,
    assigned: orders.filter((o) => o.status === 'assigned').length,
    outForDelivery: orders.filter((o) => o.status === 'out_for_delivery').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  const activeDeliveryPartners = deliveryPartners.filter((p) => p.status === 'active');

  const partnerGroups = useMemo(() => {
    const groups = new Map<string, { partner: DeliveryPartner | null; orders: Order[] }>();
    filteredOrders.forEach((order) => {
      const key = order.deliveryPartnerId || 'unassigned';
      if (!groups.has(key)) {
        const partner = order.deliveryPartnerId
          ? deliveryPartners.find((p) => p.id === order.deliveryPartnerId) || null
          : null;
        groups.set(key, { partner, orders: [] });
      }
      groups.get(key)!.orders.push(order);
    });
    return Array.from(groups.entries()).sort(([keyA], [keyB]) => {
      if (keyA === 'unassigned') return 1;
      if (keyB === 'unassigned') return -1;
      return 0;
    });
  }, [filteredOrders, deliveryPartners]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track customer orders
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Placed</p>
              <h3 className="text-2xl font-bold">{orderStats.placed}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
              <span className="status-badge status-pending">●</span>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assigned</p>
              <h3 className="text-2xl font-bold">{orderStats.assigned}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="status-badge status-processing">●</span>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out for Delivery</p>
              <h3 className="text-2xl font-bold">{orderStats.outForDelivery}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-chart-5/20 flex items-center justify-center">
              <Truck className="h-4 w-4 text-chart-5" />
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <h3 className="text-2xl font-bold">{orderStats.delivered}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <span className="status-badge status-delivered">●</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                dispatch(setStatusFilter(value as OrderStatus | 'all'))
              }
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="byPartner" className="gap-2">
            <Users className="h-4 w-4" />
            By Delivery Partner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">
                Orders ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <OrdersTable
                  orders={paginatedOrders}
                  activeDeliveryPartners={activeDeliveryPartners}
                  onAssignPartner={handleAssignPartner}
                  onCancelOrder={handleCancelOrder}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
                    {filteredOrders.length} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byPartner">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Orders by Delivery Partner</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : partnerGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No orders yet.</p>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {partnerGroups.map(([key, group]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {group.partner ? group.partner.name : 'Unassigned'}
                          </span>
                          {group.partner && (
                            <Badge
                              variant={
                                group.partner.availability === 'available'
                                  ? 'default'
                                  : group.partner.availability === 'busy'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {availabilityLabel(group.partner)}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {group.orders.length} order{group.orders.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <OrdersTable
                          orders={group.orders}
                          activeDeliveryPartners={activeDeliveryPartners}
                          onAssignPartner={handleAssignPartner}
                          onCancelOrder={handleCancelOrder}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
