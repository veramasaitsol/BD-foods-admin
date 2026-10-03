import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setSearchQuery,
  setSelectedCategory,
  toggleProductStatus,
  toggleBestSeller,
  deleteProduct,
  addProduct,
  updateProduct,
  fetchProducts,
  Product,
  ProductInput,
} from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import ProductModal from '@/components/modals/ProductModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const Products = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading, searchQuery, selectedCategory } = useAppSelector(
    (state) => state.products
  );
  const { items: categories } = useAppSelector((state) => state.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || String(product.categoryId) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [statusToToggle, setStatusToToggle] = useState<Product | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const handleToggleStatus = (product: Product) => {
    setStatusToToggle(product);
    setStatusModalOpen(true);
  };

  const confirmToggleStatus = () => {
    if (statusToToggle) {
      dispatch(toggleProductStatus(statusToToggle));
      toast({
        title: 'Product status updated',
        description: `${statusToToggle.name} is now ${statusToToggle.status === 'active' ? 'inactive' : 'active'}.`,
      });
    }
    setStatusModalOpen(false);
    setStatusToToggle(null);
  };

  const handleToggleBestSeller = (product: Product) => {
    dispatch(toggleBestSeller(product));
    toast({
      title: product.isBestSeller ? 'Removed from Best Sellers' : 'Added to Best Sellers',
      description: `${product.name} has been updated.`,
    });
  };

  const handleOpenModal = (mode: 'view' | 'edit' | 'add', product: Product | null = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = async (input: ProductInput) => {
    try {
      if (modalMode === 'add') {
        await dispatch(addProduct(input)).unwrap();
        toast({ title: 'Product added', description: 'New product has been added.' });
      } else if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct.id, input })).unwrap();
        toast({ title: 'Product updated', description: 'Product has been updated.' });
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

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete)).unwrap();
        toast({
          title: 'Product deleted',
          description: 'The product has been removed.',
          variant: 'destructive',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete product'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => dispatch(setSelectedCategory(value))}
            >
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">
            All Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Best Seller</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} className="table-row">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
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
                  <TableCell>
                    <div>
                      {product.discountedPrice ? (
                        <>
                          <span className="font-medium">
                            ₹{product.discountedPrice}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground line-through">
                            ₹{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium">₹{product.price}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock < 10
                          ? 'destructive'
                          : product.stock < 20
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {product.stock} units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(product)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isBestSeller}
                      onCheckedChange={() => handleToggleBestSeller(product)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal('view', product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenModal('edit', product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                {filteredProducts.length} products
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

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        mode={modalMode}
        onSave={handleSaveProduct}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
      <DeleteConfirmModal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusToToggle(null); }}
        onConfirm={confirmToggleStatus}
        title="Toggle Product Status"
        description={statusToToggle ? `Are you sure you want to ${statusToToggle.status === 'active' ? 'deactivate' : 'activate'} "${statusToToggle.name}"?` : ''}
      />
    </div>
  );
};

export default Products;
