import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  Faq,
  FaqInput,
} from '@/store/slices/faqsSlice';
import { HelpCircle, Plus, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/common/Pagination';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

const ITEMS_PER_PAGE = 8;

const Faqs = () => {
  const dispatch = useAppDispatch();
  const { items: faqs, loading } = useAppSelector((state) => state.faqs);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  useEffect(() => {
    if (selectedFaq && modalMode === 'edit') {
      setQuestion(selectedFaq.question);
      setAnswer(selectedFaq.answer);
      setSortOrder(selectedFaq.sortOrder);
      setStatus(selectedFaq.status);
    } else {
      setQuestion('');
      setAnswer('');
      setSortOrder(0);
      setStatus('active');
    }
  }, [selectedFaq, modalMode, modalOpen]);

  const totalPages = Math.ceil(faqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = faqs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (mode: 'edit' | 'add', faq: Faq | null = null) => {
    setModalMode(mode);
    setSelectedFaq(faq);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast({ title: 'Error', description: 'Question and answer are required', variant: 'destructive' });
      return;
    }

    const input: FaqInput = { question, answer, sortOrder, status };

    try {
      if (modalMode === 'add') {
        await dispatch(createFaq(input)).unwrap();
        toast({ title: 'FAQ created', description: 'New FAQ has been added.' });
      } else if (selectedFaq) {
        await dispatch(updateFaq({ id: selectedFaq.id, input })).unwrap();
        toast({ title: 'FAQ updated', description: 'FAQ has been updated.' });
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
    setFaqToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (faqToDelete) {
      try {
        await dispatch(deleteFaq(faqToDelete)).unwrap();
        toast({ title: 'FAQ deleted', description: 'The FAQ has been removed.', variant: 'destructive' });
      } catch (error) {
        toast({
          title: 'Error',
          description: getErrorMessage(error, 'Failed to delete FAQ'),
          variant: 'destructive',
        });
      }
      setDeleteModalOpen(false);
      setFaqToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">FAQs</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions shown to customers</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal('add')}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">All FAQs ({faqs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && faqs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs yet</h3>
              <p className="text-muted-foreground mb-4">Add frequently asked questions to help your customers</p>
              <Button onClick={() => handleOpenModal('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFaqs.map((faq) => (
                  <TableRow key={faq.id} className="table-row">
                    <TableCell className="font-medium max-w-xs">
                      <p className="line-clamp-2">{faq.question}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm">
                      <p className="line-clamp-2">{faq.answer}</p>
                    </TableCell>
                    <TableCell>{faq.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={faq.status === 'active' ? 'default' : 'secondary'}>
                        {faq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal('edit', faq)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(faq.id)}
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
            totalItems={faqs.length}
            itemsPerPage={ITEMS_PER_PAGE}
            itemLabel="FAQs"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {modalMode === 'add' ? 'Add FAQ' : 'Edit FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How do I track my order?"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer *</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="Provide a clear and helpful answer..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <NumberInput
                  value={sortOrder}
                  onChange={(value) => setSortOrder(value ?? 0)}
                  allowDecimal={false}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: 'active' | 'inactive') => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {modalMode === 'add' ? 'Add FAQ' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
};

export default Faqs;
