import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, HeartHandshake, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const changePassword = useAuthStore((s) => s.changePassword);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Please fill all fields');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-heading">
            {user?.isTemporaryPassword ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="text-sm text-subtle mt-1">
            {user?.isTemporaryPassword
              ? 'Create a personal password to secure your account'
              : 'Update your account password'}
          </p>
        </div>

        {/* Warning banner */}
        {user?.isTemporaryPassword && (
          <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-accent-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-heading">Temporary password active</p>
              <p className="text-xs text-subtle mt-0.5">You must set a new password before accessing the app.</p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">
                {user?.isTemporaryPassword ? 'Temporary Password' : 'Current Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface border border-border rounded-xl text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type={showNew ? 'text' : 'password'} placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-surface border border-border rounded-xl text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-subtle mb-1.5">Confirm New Password</label>
              <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-xl text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-60 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 text-muted">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Famora — Family Aura</span>
        </div>
      </div>
    </div>
  );
}
