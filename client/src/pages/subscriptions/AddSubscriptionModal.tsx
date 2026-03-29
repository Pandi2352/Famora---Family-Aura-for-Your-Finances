import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../lib/api/subscription.api';
import type { SubscriptionItem } from '../../lib/api/subscription.api';
import { useFamilyStore } from '../../stores/family.store';
import Dropdown from '../../components/ui/Dropdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: SubscriptionItem | null;
}

const CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const CATEGORY_OPTIONS = [
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Bills & Utilities', label: 'Bills & Utilities' },
  { value: 'Health & Medical', label: 'Health & Medical' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

export default function AddSubscriptionModal({ open, onClose, onSuccess, editData }: Props) {
  const { activeFamily } = useFamilyStore();
  const isEdit = !!editData;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [dueDate, setDueDate] = useState('');
  const [autoDebit, setAutoDebit] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editData?.name || '');
      setAmount(editData?.amount?.toString() || '');
      setCategory(editData?.category || 'Entertainment');
      setBillingCycle(editData?.billingCycle || 'monthly');
      setDueDate(editData?.dueDate?.toString() || '');
      setAutoDebit(editData?.autoDebit || false);
      setNotes(editData?.notes || '');
      setLoading(false);
    }
  }, [open, editData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return toast.error('Fill required fields');
    if (!activeFamily) return;

    setLoading(true);
    try {
      if (isEdit && editData) {
        await subscriptionApi.update(editData.id, activeFamily.id, {
          name, amount: parseFloat(amount), category, billingCycle,
          dueDate: parseInt(dueDate), autoDebit, notes,
        });
        toast.success('Subscription updated');
      } else {
        await subscriptionApi.create({
          name, amount: parseFloat(amount), category, billingCycle,
          dueDate: parseInt(dueDate), autoDebit, notes,
          familyId: activeFamily.id,
        });
        toast.success('Subscription added');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-heading">{isEdit ? 'Edit Subscription' : 'Add Subscription'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Netflix"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
                <input type="number" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="649"
                  className="w-full pl-7 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
            </div>
            <Dropdown label="Billing Cycle" options={CYCLE_OPTIONS} value={billingCycle} onChange={setBillingCycle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} allowCustom />
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Due Date (day)</label>
              <input type="number" min="1" max="31" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="15"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Family plan"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoDebit} onChange={(e) => setAutoDebit(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-subtle">Auto-debit enabled</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
