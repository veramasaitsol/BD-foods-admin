import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateStock, fetchProducts, Product } from '@/store/slices/productsSlice';
import { AlertTriangle, Package, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import StockModal from '@/components/modals/StockModal';

const Inventory = () => {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const lowStockThreshold = 15;
  const criticalStockThreshold = 5;

  const lowStockProducts = products.filter((p) => p.stock < lowStockThreshold);
  const criticalStockProducts = products.filter(
    (p) => p.stock < criticalStockThreshold
  );
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const avgStock = products.length ? Math.round(totalStock / products.length) : 0;

  const getStockStatus = (stock: number) => {
    if (stock < criticalStockThreshold) return 'critical';
    if (stock < lowStockThreshold) return 'low';
    return 'good';
  };

  const handleOpenStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      await dispatch(updateStock({ id, stock })).unwrap();
      toast({
        title: 'Stock updated',
        description: 'Product stock has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update stock'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Inventory
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage stock levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <h3 className="text-2xl font-bold">{totalStock.toLocaleString()}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Stock/Product</p>
              <h3 className="text-2xl font-bold">{avgStock}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-warning">
                {lowStockProducts.length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Stock</p>
              <h3 className="text-2xl font-bold text-destructive">
                {criticalStockProducts.length}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...products]
                .sort((a, b) => a.stock - b.stock)
                .map((product) => {
                  const status = getStockStatus(product.stock);
                  const maxStock = 100;
                  const percentage = Math.min(
                    (product.stock / maxStock) * 100,
                    100
                  );

                  return (
                    <TableRow key={product.id} className="table-row">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <img
                              src={product.image || '/placeholder.svg'}
                              alt={product.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.weight}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category?.name || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.stock} units
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <Progress
                            value={percentage}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === 'critical'
                              ? 'destructive'
                              : status === 'low'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {status === 'critical'
                            ? 'Critical'
                            : status === 'low'
                            ? 'Low Stock'
                            : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenStockModal(product)}
                        >
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Modal */}
      <StockModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        product={selectedProduct}
        onUpdate={handleUpdateStock}
      />
    </div>
  );
};

export default Inventory;
