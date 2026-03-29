import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { goalApi } from '../../lib/api/goal.api';
import type { GoalItem } from '../../lib/api/goal.api';
import { useFamilyStore } from '../../stores/family.store';
import Dropdown from '../../components/ui/Dropdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: GoalItem | null;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const COLOR_OPTIONS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export default function CreateGoalModal({ open, onClose, onSuccess, editData }: Props) {
  const { activeFamily } = useFamilyStore();
  const isEdit = !!editData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(editData?.title || '');
      setDescription(editData?.description || '');
      setTargetAmount(editData?.targetAmount?.toString() || '');
      setDeadline(editData?.deadline?.slice(0, 10) || '');
      setPriority(editData?.priority || 'medium');
      setColor(editData?.color || '#6366f1');
      setLoading(false);
    }
  }, [open, editData]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return toast.error('Fill required fields');
    if (!activeFamily) return;

    setLoading(true);
    try {
      if (isEdit && editData) {
        await goalApi.update(editData.id, activeFamily.id, {
          title, description, targetAmount: parseFloat(targetAmount),
          deadline: deadline || undefined, priority, color,
        });
        toast.success('Goal updated');
      } else {
        await goalApi.create({
          title, description, targetAmount: parseFloat(targetAmount),
          deadline: deadline || undefined, priority, color,
          familyId: activeFamily.id,
        });
        toast.success('Goal created');
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
          <h2 className="text-lg font-semibold text-heading">{isEdit ? 'Edit Goal' : 'Create Goal'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Goal Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Family Vacation"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Goa trip"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
                <input type="number" step="any" min="1" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="80000"
                  className="w-full pl-7 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            </div>
          </div>

          <Dropdown label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
