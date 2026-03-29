import { useState, useRef, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import { userApi, getAvatarUrl } from '../../lib/api/user.api';
import { notificationApi } from '../../lib/api/notification.api';

type SettingsTab = 'profile' | 'security' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Settings</h1>
        <p className="text-sm text-subtle mt-1">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-52 flex-shrink-0">
          <nav className="bg-card border border-border rounded-xl p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    tab === t.id
                      ? 'bg-primary-500/10 text-primary-600'
                      : 'text-subtle hover:text-heading hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const avatarUrl = getAvatarUrl(user?.avatar || null);
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
      const data = res.data.data;
      updateUser({ name: data.name, phone: data.phone });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Only JPG, PNG, WEBP');

    setUploading(true);
    try {
      const res = await userApi.uploadAvatar(file);
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return;
    try {
      await userApi.removeAvatar();
      updateUser({ avatar: null });
      toast.success('Avatar removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-heading mb-5">Profile</h2>

      <div className="flex items-center gap-5 mb-8">
        <div className="relative group">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-surface" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-surface">
              {initials}
            </div>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
        </div>

        <div>
          <p className="text-sm font-semibold text-heading">{user?.name}</p>
          <p className="text-xs text-muted">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
              <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload photo'}
            </button>
            {user?.avatar && (
              <button type="button" onClick={handleRemoveAvatar}
                className="flex items-center gap-1.5 text-xs font-medium text-danger-600 hover:text-danger-700 transition-colors">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted mt-1">JPG, PNG or WEBP. Max 2MB.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="w-full px-3 py-2 text-sm bg-surface/50 border border-border rounded-lg text-muted cursor-not-allowed" />
          <p className="text-[10px] text-muted mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">Phone (optional)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210"
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const changePassword = useAuthStore((s) => s.changePassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Fill all fields');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-heading mb-5">Change Password</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 pr-10 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">New Password</label>
          <div className="relative">
            <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 pr-10 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-subtle mb-1.5">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NotificationsTab() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; isRead: boolean; type: string; createdAt: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    notificationApi.list(50)
      .then((res) => setNotifications(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const TYPE_COLORS: Record<string, string> = {
    budget_warning: 'border-l-accent-500',
    budget_exceeded: 'border-l-danger-500',
    bill_due: 'border-l-blue-500',
    goal_reached: 'border-l-success-500',
    expense_added: 'border-l-primary-500',
    member_joined: 'border-l-violet-500',
    system: 'border-l-slate-400',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-heading">Notifications</h2>
          <p className="text-xs text-muted mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`p-3 rounded-lg border-l-4 transition-colors ${
                TYPE_COLORS[n.type] || 'border-l-slate-300'
              } ${n.isRead ? 'bg-surface/50' : 'bg-primary-500/[0.03]'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-medium ${n.isRead ? 'text-subtle' : 'text-heading'}`}>{n.title}</p>
                  <p className="text-xs text-muted mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
              </div>
              <p className="text-[10px] text-muted mt-1.5">
                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
