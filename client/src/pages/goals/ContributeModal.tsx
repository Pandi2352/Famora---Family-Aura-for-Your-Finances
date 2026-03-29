import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { goalApi } from '../../lib/api/goal.api';
import type { GoalItem } from '../../lib/api/goal.api';
import { useFamilyStore } from '../../stores/family.store';

interface Props {
  goal: GoalItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContributeModal({ goal, onClose, onSuccess }: Props) {
  const { activeFamily } = useFamilyStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setAmount('');
      setNote('');
      setLoading(false);
    }
  }, [goal]);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return toast.error('Enter an amount');
    if (!activeFamily) return;

    setLoading(true);
    try {
      await goalApi.contribute(goal.id, activeFamily.id, {
        amount: parseFloat(amount),
        note: note || undefined,
      });
      toast.success('Contribution added!');
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
          <div>
            <h2 className="text-lg font-semibold text-heading">Add Contribution</h2>
            <p className="text-xs text-muted mt-0.5">{goal.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary */}
        <div className="bg-surface border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-subtle">Saved so far</span>
            <span className="font-semibold text-heading">₹{goal.savedAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-subtle">Remaining</span>
            <span className="font-semibold text-heading">₹{goal.remaining.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(goal.percent, 100)}%`, background: goal.color }} />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
              <input type="number" step="any" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5000"
                className="w-full pl-7 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., March savings"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
