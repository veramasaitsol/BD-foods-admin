import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDashboardStats, fetchSalesChart } from '@/store/slices/dashboardSlice';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchCustomers } from '@/store/slices/customersSlice';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
  trendValue: string;
  color: string;
}) => (
  <Card className="card-stat">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="mt-2 text-3xl font-bold font-heading">{value}</h3>
        <div className="mt-2 flex items-center gap-1 text-sm">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={trend === 'up' ? 'text-success' : 'text-destructive'}>
            {trendValue}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      </div>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Card>
);

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'status-badge status-pending',
    processing: 'status-badge status-processing',
    shipped: 'status-badge status-shipped',
    delivered: 'status-badge status-delivered',
    cancelled: 'status-badge status-cancelled',
    active: 'bg-success/10 text-success',
    blocked: 'bg-destructive/10 text-destructive',
  };
  return <span className={`${styles[status] || 'status-badge'} px-2 py-1 rounded text-xs font-medium`}>{status}</span>;
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { stats, salesData } = useAppSelector((state) => state.dashboard);
  const { items: orders } = useAppSelector((state) => state.orders);
  const { items: products } = useAppSelector((state) => state.products);
  const { items: customers } = useAppSelector((state) => state.customers);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchSalesChart('week'));
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock < 15).slice(0, 5);
  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`₹${stats.totalSales.toLocaleString()}`}
          icon={IndianRupee}
          trend="up"
          trendValue="+12.5%"
          color="bg-primary"
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday.toString()}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2%"
          color="bg-accent"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          trend="up"
          trendValue="+3.1%"
          color="bg-success"
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+5.7%"
          color="bg-chart-5"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Weekly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="table-row">
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-heading flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id} className="table-row">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.stock < 10 ? 'destructive' : 'secondary'}
                      >
                        {product.stock} left
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.map((customer) => (
                  <TableRow key={customer.id} className="table-row">
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
