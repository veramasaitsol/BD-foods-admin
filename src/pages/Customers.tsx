import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setSearchQuery, toggleCustomerStatusAsync, fetchCustomers, Customer } from '@/store/slices/customersSlice';
import { Search, Mail, Phone, Ban, CheckCircle, Users } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Pagination from '@/components/common/Pagination';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 8;

const Customers = () => {
  const dispatch = useAppDispatch();
  const { items: customers, searchQuery } = useAppSelector(
    (state) => state.customers
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleStatus = async (customer: Customer) => {
    const currentStatus = customer.status;
    try {
      await dispatch(toggleCustomerStatusAsync(customer)).unwrap();
      toast({
        title: currentStatus === 'active' ? 'Customer blocked' : 'Customer activated',
        description: `The customer account has been ${
          currentStatus === 'active' ? 'blocked' : 'activated'
        }.`,
        variant: currentStatus === 'active' ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update customer status'),
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Customers
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your customer base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
          </div>
        </Card>
        <Card className="card-stat">
          <div>
            <p className="text-sm text-muted-foreground">Active Customers</p>
            <h3 className="text-2xl font-bold mt-1 text-success">{stats.active}</h3>
          </div>
        </Card>
        <Card className="card-stat">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <h3 className="text-2xl font-bold mt-1">₹{stats.totalSpent.toLocaleString()}</h3>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">
            All Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchQuery ? 'No customers match your search. Try a different term.' : 'Customers will appear here once they register on your store.'}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer.id} className="table-row">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone || '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.totalOrders} orders</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.joinedAt ? format(new Date(customer.joinedAt), 'MMM dd, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.status === 'active' ? 'default' : 'destructive'}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(customer)}
                      className={
                        customer.status === 'active'
                          ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                          : 'text-success hover:bg-success/10 hover:text-success'
                      }
                    >
                      {customer.status === 'active' ? (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCustomers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="customers"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;