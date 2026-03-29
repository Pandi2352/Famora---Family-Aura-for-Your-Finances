import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFamilyStore } from '../../stores/family.store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditFamilyModal({ open, onClose }: Props) {
  const { activeFamily, updateFamily } = useFamilyStore();
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && activeFamily) {
      setName(activeFamily.name);
      setSlogan(activeFamily.slogan || '');
    }
  }, [open, activeFamily]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Family name is required');
    setLoading(true);
    try {
      await updateFamily(name.trim(), slogan.trim());
      toast.success('Family updated!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-heading">Edit Family</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Family Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g., Pandi's Family"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">
              Family Slogan <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              maxLength={100}
              placeholder="e.g., Together we grow"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            <p className="text-[10px] text-muted mt-1">Shown in the navbar — a motto or tagline for your family</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
