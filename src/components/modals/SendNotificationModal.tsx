import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCustomers } from '@/store/slices/customersSlice';
import { sendNotification, SendNotificationInput } from '@/store/slices/notificationsSlice';
import { getErrorMessage } from '@/lib/errors';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm: SendNotificationInput = {
  target: 'all',
  userId: '',
  title: '',
  message: '',
};

const SendNotificationModal = ({ open, onClose }: SendNotificationModalProps) => {
  const dispatch = useAppDispatch();
  const customers = useAppSelector((state) => state.customers.items);
  const [formData, setFormData] = useState<SendNotificationInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCustomers());
      setFormData(emptyForm);
    }
  }, [open, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.target === 'specific' && !formData.userId) {
      toast({ title: 'Select a member', description: 'Choose which customer should receive this notification.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const message = await dispatch(sendNotification(formData)).unwrap();
      toast({ title: 'Notification sent', description: message });
      onClose();
    } catch (error) {
      toast({ title: 'Failed to send', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Send Notification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Send to</Label>
            <Select
              value={formData.target}
              onValueChange={(value: 'specific' | 'all') => setFormData({ ...formData, target: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="specific">Specific Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target === 'specific' && (
            <div className="space-y-2">
              <Label>Member</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData({ ...formData, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">No customers found</div>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} — {customer.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekend Special Offer"
              maxLength={160}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write the notification message…"
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationModal;
