import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchReviews,
  moderateReviewAsync,
  deleteReviewAsync,
  setStatusFilter,
  type Review,
  type ReviewStatus,
} from '@/store/slices/reviewsSlice';
import { Star, Eye, EyeOff, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/common/Pagination';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 8;

const statusOptions: Array<{ value: ReviewStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Reviews' },
  { value: 'approved', label: 'Shown' },
  { value: 'hidden', label: 'Hidden' },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn('h-3.5 w-3.5', i < rating ? 'fill-warning text-warning' : 'text-muted-foreground')}
      />
    ))}
  </div>
);

const Reviews = () => {
  const dispatch = useAppDispatch();
  const { items: reviews, loading, statusFilter } = useAppSelector((state) => state.reviews);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  const filteredReviews = reviews.filter(
    (review) => statusFilter === 'all' || review.status === statusFilter
  );

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleVisibility = async (review: Review) => {
    const nextStatus: ReviewStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      await dispatch(moderateReviewAsync({ id: review.id, status: nextStatus })).unwrap();
      toast({ title: nextStatus === 'hidden' ? 'Review hidden' : 'Review shown' });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update review'),
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await dispatch(deleteReviewAsync(reviewToDelete.id)).unwrap();
      toast({ title: 'Review deleted', variant: 'destructive' });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to delete review'),
        variant: 'destructive',
      });
    }
    setReviewToDelete(null);
  };

  const stats = {
    total: reviews.length,
    shown: reviews.filter((r) => r.status === 'approved').length,
    hidden: reviews.filter((r) => r.status === 'hidden').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Manage customer ratings and reviews — choose what's shown on your storefront
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shown</p>
              <h3 className="text-2xl font-bold">{stats.shown}</h3>
            </div>
          </div>
        </Card>
        <Card className="card-stat">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hidden</p>
              <h3 className="text-2xl font-bold">{stats.hidden}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-heading">All Reviews ({filteredReviews.length})</CardTitle>
          <Select
            value={statusFilter}
            onValueChange={(value) => dispatch(setStatusFilter(value as ReviewStatus | 'all'))}
          >
            <SelectTrigger className="w-40">
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
        </CardHeader>
        <CardContent>
          {loading && reviews.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reviews yet.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map((review) => (
                    <TableRow key={review.id} className="table-row">
                      <TableCell className="font-medium">
                        {review.product?.name || 'Deleted product'}
                      </TableCell>
                      <TableCell>{review.customer?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment || '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                          {review.status === 'approved' ? 'Shown' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={review.status === 'approved' ? 'Hide review' : 'Show review'}
                            onClick={() => handleToggleVisibility(review)}
                          >
                            {review.status === 'approved' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setReviewToDelete(review)}
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
                totalItems={filteredReviews.length}
                itemsPerPage={ITEMS_PER_PAGE}
                itemLabel="reviews"
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmModal
        open={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        description="Are you sure you want to permanently delete this review? This action cannot be undone."
      />
    </div>
  );
};

export default Reviews;
