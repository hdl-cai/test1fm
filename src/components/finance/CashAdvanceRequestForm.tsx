import { useState, useEffect } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Money01Icon, ClipboardIcon, CalendarIcon } from '@/hooks/useIcon';

interface CashAdvanceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; reason: string; requestDate: string }) => Promise<void>;
  isSaving?: boolean;
}

export function CashAdvanceRequestForm({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
}: CashAdvanceRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setReason('');
      setRequestDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!amount || parseFloat(amount) < 100) newErrors.amount = 'Amount must be at least ₱100.';
    if (!reason.trim()) newErrors.reason = 'Please provide a reason.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({ amount: parseFloat(amount), reason: reason.trim(), requestDate });
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Request Cash Advance" description="Submit a request for salary cash advance" width="md">
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Money01Icon size={12} /> Amount (PHP)
          </Label>
          <Input
            type="number" min="100" step="0.01" placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: undefined })); }}
            className={cn('h-9', errors.amount && 'border-red-500')}
            aria-invalid={!!errors.amount}
          />
          {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ClipboardIcon size={12} /> Reason
          </Label>
          <Textarea
            placeholder="Briefly describe why you need this cash advance…"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setErrors((prev) => ({ ...prev, reason: undefined })); }}
            className={cn('min-h-24', errors.reason && 'border-red-500')}
            aria-invalid={!!errors.reason}
          />
          {errors.reason && <p className="text-xs text-red-400">{errors.reason}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={12} /> Request Date
          </Label>
          <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="h-9" />
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
