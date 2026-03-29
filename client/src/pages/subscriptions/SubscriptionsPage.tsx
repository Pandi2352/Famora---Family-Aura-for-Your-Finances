import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Calendar, CircleDot, Plus, Pencil, Trash2, Loader2,
  ToggleLeft, ToggleRight, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../lib/api/subscription.api';
import type { SubscriptionItem, SubscriptionSummary } from '../../lib/api/subscription.api';
import { useFamilyStore } from '../../stores/family.store';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AddSubscriptionModal from './AddSubscriptionModal';

export default function SubscriptionsPage() {
  const { activeFamily } = useFamilyStore();
  const [subs, setSubs] = useState<SubscriptionItem[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<SubscriptionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubs = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        subscriptionApi.list(activeFamily.id),
        subscriptionApi.summary(activeFamily.id),
      ]);
      setSubs(listRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [activeFamily]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleDelete = async () => {
    if (!deleteTarget || !activeFamily) return;
    setDeleting(true);
    try {
      await subscriptionApi.delete(deleteTarget.id, activeFamily.id);
      toast.success('Subscription deleted');
      setDeleteTarget(null);
      fetchSubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (sub: SubscriptionItem) => {
    if (!activeFamily) return;
    try {
      await subscriptionApi.update(sub.id, activeFamily.id, { isActive: !sub.isActive });
      fetchSubs();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  const active = subs.filter((s) => s.isActive);
  const inactive = subs.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Auto Payments</h1>
          <p className="text-sm text-subtle mt-1">Manage your recurring bills and subscriptions</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Monthly Cost</p>
            <p className="text-lg font-bold text-heading">₹{(summary?.monthlyTotal || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Active</p>
            <p className="text-lg font-bold text-heading">{summary?.activeCount || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Due This Week</p>
            <p className="text-lg font-bold text-heading">{summary?.dueThisWeek || 0}</p>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      {summary?.upcoming && summary.upcoming.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-3">Upcoming Payments</h2>
          <div className="space-y-3">
            {summary.upcoming.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${sub.daysUntilDue <= 3 ? 'bg-danger-500/10' : 'bg-primary-500/10'}`}>
                    <Clock className={`w-4 h-4 ${sub.daysUntilDue <= 3 ? 'text-danger-600' : 'text-primary-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-heading">{sub.name}</p>
                    <p className="text-xs text-muted">₹{sub.amount.toLocaleString('en-IN')}/{sub.billingCycle === 'monthly' ? 'mo' : sub.billingCycle === 'yearly' ? 'yr' : 'qtr'}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${sub.daysUntilDue <= 3 ? 'text-danger-600' : 'text-subtle'}`}>
                  {sub.daysUntilDue === 0 ? 'Due today' : sub.daysUntilDue < 0 ? 'Overdue' : `${sub.daysUntilDue}d left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-heading">All Subscriptions</h2>
        </div>
        {subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CreditCard className="w-10 h-10 text-muted mb-3" />
            <p className="text-sm font-medium text-heading mb-1">No subscriptions yet</p>
            <p className="text-xs text-muted">Add recurring bills to track them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3 hidden sm:table-cell">Cycle</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3 hidden md:table-cell">Next Due</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-subtle px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...active, ...inactive].map((sub) => (
                  <tr key={sub.id} className="border-b border-border last:border-b-0 group hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className={`text-sm font-medium ${sub.isActive ? 'text-heading' : 'text-muted line-through'}`}>{sub.name}</p>
                      <p className="text-xs text-muted">{sub.category}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-heading">₹{sub.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-sm text-subtle capitalize">{sub.billingCycle}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-sm text-subtle">
                      {new Date(sub.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleToggleActive(sub)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sub.isActive ? 'text-success-600 bg-success-500/10' : 'text-muted bg-surface'
                        }`}>
                        {sub.isActive ? <><ToggleRight className="w-3 h-3" /> Active</> : <><ToggleLeft className="w-3 h-3" /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditData(sub); setModalOpen(true); }}
                          className="p-1.5 rounded hover:bg-surface text-muted hover:text-heading transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(sub)}
                          className="p-1.5 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddSubscriptionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSuccess={() => { setModalOpen(false); setEditData(null); fetchSubs(); }}
        editData={editData}
      />
      <ConfirmDialog open={!!deleteTarget} danger title="Delete subscription?"
        message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete"
        loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
