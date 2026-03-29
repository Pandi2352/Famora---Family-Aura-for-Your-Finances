import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetApi } from '../../lib/api/budget.api';
import type { BudgetItem } from '../../lib/api/budget.api';
import { EXPENSE_CATEGORIES } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';
import Dropdown from '../../components/ui/Dropdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: BudgetItem | null;
}

export default function CreateBudgetModal({ open, onClose, onSuccess, editData }: Props) {
  const { activeFamily } = useFamilyStore();
  const isEdit = !!editData;

  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const now = new Date();

  useEffect(() => {
    if (open) {
      setCategory(editData?.category || '');
      setLimit(editData?.limit?.toString() || '');
      setLoading(false);
    }
  }, [open, editData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return toast.error('Fill all fields');
    if (!activeFamily) return;

    setLoading(true);
    try {
      if (isEdit && editData) {
        await budgetApi.update(editData.id, activeFamily.id, {
          category,
          limit: parseFloat(limit),
        });
        toast.success('Budget updated');
      } else {
        await budgetApi.create({
          category,
          limit: parseFloat(limit),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          familyId: activeFamily.id,
        });
        toast.success('Budget created');
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
      <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-heading">
            {isEdit ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Dropdown
            label="Category"
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={setCategory}
            placeholder="Select category..."
            allowCustom
          />

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="8000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          </div>

          {!isEdit && (
            <p className="text-[10px] text-muted">
              Budget for {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
