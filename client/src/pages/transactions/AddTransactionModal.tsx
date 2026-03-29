import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseApi, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';
import Dropdown from '../../components/ui/Dropdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    note: string;
    date: string;
    paymentMethod: string;
  } | null;
}

export default function AddTransactionModal({ open, onClose, onSuccess, editData }: Props) {
  const { activeFamily } = useFamilyStore();
  const isEdit = !!editData;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  // Sync form state when editData changes or modal opens
  useEffect(() => {
    if (open) {
      setType(editData?.type || 'expense');
      setAmount(editData?.amount?.toString() || '');
      setCategory(editData?.category || '');
      setNote(editData?.note || '');
      setDate(editData?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
      setPaymentMethod(editData?.paymentMethod || 'upi');
      setLoading(false);
    }
  }, [open, editData]);

  if (!open) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return toast.error('Fill required fields');
    if (!activeFamily) return toast.error('No family selected');

    setLoading(true);
    try {
      if (isEdit && editData) {
        await expenseApi.update(editData.id, activeFamily.id, {
          type, amount: parseFloat(amount), category, note, date, paymentMethod,
        });
        toast.success('Transaction updated');
      } else {
        await expenseApi.create({
          type, amount: parseFloat(amount), category, note, date, paymentMethod,
          familyId: activeFamily.id,
        });
        toast.success('Transaction added');
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
          <h2 className="text-lg font-semibold text-heading">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="flex bg-surface rounded-lg p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategory(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-danger-500 text-white shadow-sm'
                      : 'bg-success-500 text-white shadow-sm'
                    : 'text-subtle hover:text-heading'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Category */}
          <Dropdown
            label="Category"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={setCategory}
            placeholder="Select category..."
            allowCustom
          />

          {/* Date + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <Dropdown
              label="Payment"
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={setPaymentMethod}
              placeholder="Select..."
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g., Swiggy dinner"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
