import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategoryAsync,
  deleteCategoryAsync,
  reorderCategoriesAsync,
  setCategoriesOrder,
  Category,
  clearError
} from '@/store/slices/categoriesSlice';
import { FolderOpen, Plus, Edit, Trash2, GripVertical, Loader2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import CategoryModal from '@/components/modals/CategoryModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const Categories = () => {
  const dispatch = useAppDispatch();
  const { items: categories, loading, error } = useAppSelector((state) => state.categories);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpenModal = (mode: 'edit' | 'add', category: Category | null = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (modalMode === 'add') {
        await dispatch(createCategory({
          name: categoryData.name,
          description: categoryData.description,
          image: categoryData.image, // This should be a File object from the form
        })).unwrap();
        
        toast({ 
          title: 'Category added', 
          description: 'New category has been created successfully.' 
        });
      } else if (selectedCategory) {
        await dispatch(updateCategoryAsync({
          id: selectedCategory.id,
          categoryData: {
            name: categoryData.name,
            description: categoryData.description,
            image: categoryData.image,
          }
        })).unwrap();
        
        toast({ 
          title: 'Category updated', 
          description: 'Category has been updated successfully.' 
        });
      }
      
      setModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${modalMode === 'add' ? 'create' : 'update'} category`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await dispatch(deleteCategoryAsync(categoryToDelete)).unwrap();
        
        toast({
          title: 'Category deleted',
          description: 'The category has been removed successfully.',
        });
        
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId) return;

    const fromIndex = categories.findIndex((c) => c.id === draggedId);
    const toIndex = categories.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...categories];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    dispatch(setCategoriesOrder(next));
    dispatch(reorderCategoriesAsync(next.map((c) => c.id)))
      .unwrap()
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to save the new category order', variant: 'destructive' });
        dispatch(fetchCategories());
      });
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage product categories
          </p>
        </div>
        <Button 
          className="gap-2" 
          onClick={() => handleOpenModal('add')}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Categories</p>
              <h3 className="text-2xl font-bold">{categories.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Products/Category</p>
              <h3 className="text-2xl font-bold">{categories.length ? Math.round(totalProducts / categories.length) : 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first category
            </p>
            <Button onClick={() => handleOpenModal('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              onDragOver={handleDragOver(category.id)}
              onDrop={handleDrop(category.id)}
              className={cn(
                'group hover:shadow-lg transition-shadow',
                draggedId === category.id && 'opacity-40',
                dragOverId === category.id && draggedId !== category.id && 'ring-2 ring-primary',
              )}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={category.image || '/placeholder.svg'}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-t-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-heading text-xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    draggable
                    onDragStart={handleDragStart(category.id)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                    className="absolute top-3 left-3 p-2 rounded-lg bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {category.productCount || 0} products
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOpenModal('edit', category)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteClick(category.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        mode={modalMode}
        onSave={handleSaveCategory}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default Categories;