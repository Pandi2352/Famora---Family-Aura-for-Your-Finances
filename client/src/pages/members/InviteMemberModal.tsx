import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { familyApi } from '../../lib/api/family.api';
import Dropdown from '../../components/ui/Dropdown';

interface Props {
  open: boolean;
  familyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'other', label: 'Other' },
];

export default function InviteMemberModal({ open, familyId, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !relationship) return toast.error('Please fill all fields');

    setLoading(true);
    try {
      const res = await familyApi.invite({ name, email, relationship, familyId });
      toast.success(res.data.message || 'Invitation sent!');
      setName(''); setEmail(''); setRelationship('');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-heading">Invite Family Member</h2>
            <p className="text-xs text-muted mt-0.5">They'll receive an email with login credentials</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Full Name</label>
            <input type="text" placeholder="e.g., Priya Sharma" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Email</label>
            <input type="email" placeholder="priya@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>

          <Dropdown
            label="Relationship"
            options={RELATIONSHIPS}
            value={relationship}
            onChange={setRelationship}
            placeholder="Select relationship..."
          />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
