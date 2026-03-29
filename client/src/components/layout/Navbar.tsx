import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, Pencil, LogOut, User, HeartHandshake, X, Command, Wallet, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useFamilyStore } from '../../stores/family.store';
import { expenseApi } from '../../lib/api/expense.api';
import { notificationApi } from '../../lib/api/notification.api';
import type { NotificationItem } from '../../lib/api/notification.api';
import EditFamilyModal from './EditFamilyModal';

export default function Navbar() {
  const [editOpen, setEditOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { activeFamily } = useFamilyStore();
  const navigate = useNavigate();
  const [netBalance, setNetBalance] = useState<number | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchBalance = () => {
    if (!activeFamily) return;
    const now = new Date();
    expenseApi.summary(activeFamily.id, now.getFullYear(), now.getMonth() + 1)
      .then((res) => setNetBalance(res.data.data.netSavings))
      .catch(() => {});
  };

  useEffect(() => { fetchBalance(); }, [activeFamily]);

  // Listen for balance refresh events (fired after add/edit/delete expense)
  useEffect(() => {
    const handler = () => fetchBalance();
    window.addEventListener('balance-refresh', handler);
    return () => window.removeEventListener('balance-refresh', handler);
  }, [activeFamily]);

  const fetchNotifications = () => {
    notificationApi.unreadCount().then((r) => setUnreadCount(r.data.data.count)).catch(() => {});
    notificationApi.list(10).then((r) => setNotifications(r.data.data)).catch(() => {});
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener('balance-refresh', handler);
    return () => window.removeEventListener('balance-refresh', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
        {/* Left — Family Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-sm">
            <HeartHandshake className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-heading">
                {activeFamily?.name || 'My Family'}
              </span>
              <button
                onClick={() => setEditOpen(true)}
                className="p-0.5 rounded text-muted hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                title="Edit family name & slogan"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
            {activeFamily?.slogan ? (
              <span className="text-[10px] text-muted italic truncate max-w-[200px]">
                "{activeFamily.slogan}"
              </span>
            ) : (
              <span className="text-[10px] text-muted/50">
                {activeFamily?.memberCount || 0} members
              </span>
            )}
          </div>
        </div>

        {/* Right — Balance + Search + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Net Balance pill */}
          {netBalance !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg">
              <Wallet className="w-3.5 h-3.5 text-muted" />
              <span className="text-[10px] text-muted font-medium">Balance</span>
              <span className={`text-xs font-bold ${netBalance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                ₹{Math.abs(netBalance).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Search trigger button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-border hover:border-primary-300 hover:bg-surface text-muted hover:text-subtle transition-all group min-w-[200px]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs flex-1 text-left">Search anything...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-medium text-muted group-hover:border-primary-200 transition-colors">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <Search className="w-[18px] h-[18px] text-subtle" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              className="relative p-2 rounded-lg hover:bg-surface transition-colors">
              <Bell className="w-[18px] h-[18px] text-subtle" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-danger-500 text-white text-[9px] font-bold rounded-full border-2 border-card px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-80 bg-card border border-border rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-heading">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => {
                        notificationApi.markAllRead().then(() => { setUnreadCount(0); setNotifications((n) => n.map((i) => ({ ...i, isRead: true }))); });
                      }} className="text-[10px] text-primary-600 font-medium hover:text-primary-700">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted text-center py-8">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id}
                          onClick={() => {
                            if (!n.isRead) {
                              notificationApi.markRead(n.id);
                              setNotifications((prev) => prev.map((i) => i.id === n.id ? { ...i, isRead: true } : i));
                              setUnreadCount((c) => Math.max(0, c - 1));
                            }
                          }}
                          className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface transition-colors ${!n.isRead ? 'bg-primary-500/[0.03]' : ''}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-xs font-medium ${!n.isRead ? 'text-heading' : 'text-subtle'}`}>{n.title}</p>
                              <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[10px] text-muted mt-1">
                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-card">
                {initials}
              </div>
              <span className="text-sm font-medium text-heading hidden sm:block">{user?.name || 'User'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-lg z-40 py-1.5">
                  <div className="px-3 py-2.5 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-heading">{user?.name}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-subtle hover:text-heading hover:bg-surface transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile & Settings
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger-600 hover:bg-danger-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Spotlight Search Overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-5 h-5 text-primary-500 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search transactions, members, budgets..."
                className="flex-1 py-4 text-sm text-heading placeholder:text-muted bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-surface text-muted hover:text-heading transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick links */}
            <div className="p-3">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider px-2 mb-2">Quick actions</p>
              {[
                { label: 'Go to Dashboard', path: '/dashboard' },
                { label: 'View Transactions', path: '/transactions' },
                { label: 'Manage Budgets', path: '/budgets' },
                { label: 'Family Members', path: '/members' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { setSearchOpen(false); navigate(item.path); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-subtle hover:text-heading hover:bg-surface transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-muted" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-surface/50 flex items-center justify-between text-[10px] text-muted">
              <span>Type to search</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-[10px] font-medium">ESC</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <EditFamilyModal open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
