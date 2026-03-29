import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet, TrendingUp, AlertTriangle, XCircle,
  CheckCircle2, CircleAlert, Pencil, Trash2, Loader2, Plus,
  Utensils, Car, Home, Zap, Film, ShoppingBag, Heart, BookOpen, ShoppingCart, Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetApi } from '../../lib/api/budget.api';
import type { BudgetItem, BudgetStatus, BudgetSummary } from '../../lib/api/budget.api';
import { useFamilyStore } from '../../stores/family.store';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CreateBudgetModal from './CreateBudgetModal';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Dining': Utensils, 'Travel & Transport': Car, 'Rent & Housing': Home,
  'Bills & Utilities': Zap, 'Entertainment': Film, 'Shopping': ShoppingBag,
  'Health & Medical': Heart, 'Education': BookOpen, 'Groceries': ShoppingCart,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-600',
  'Travel & Transport': 'bg-blue-100 text-blue-600',
  'Rent & Housing': 'bg-violet-100 text-violet-600',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-600',
  'Entertainment': 'bg-pink-100 text-pink-600',
  'Shopping': 'bg-rose-100 text-rose-600',
  'Health & Medical': 'bg-red-100 text-red-600',
  'Education': 'bg-indigo-100 text-indigo-600',
  'Groceries': 'bg-green-100 text-green-600',
};

const STATUS_CONFIG: Record<BudgetStatus, { label: string; color: string; barColor: string; icon: LucideIcon }> = {
  safe: { label: 'On Track', color: 'text-success-600 bg-success-500/10', barColor: 'bg-success-500', icon: CheckCircle2 },
  warning: { label: 'Warning', color: 'text-accent-600 bg-accent-500/10', barColor: 'bg-accent-500', icon: AlertTriangle },
  danger: { label: 'Critical', color: 'text-danger-600 bg-danger-500/10', barColor: 'bg-danger-500', icon: CircleAlert },
  exceeded: { label: 'Exceeded', color: 'text-danger-600 bg-danger-500/10', barColor: 'bg-danger-500', icon: XCircle },
};

type FilterType = 'all' | BudgetStatus;

export default function BudgetsPage() {
  const { activeFamily } = useFamilyStore();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<BudgetItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const fetchBudgets = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        budgetApi.list(activeFamily.id, year, month),
        budgetApi.summary(activeFamily.id, year, month),
      ]);
      setBudgets(listRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [activeFamily, year, month]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleDelete = async () => {
    if (!deleteTarget || !activeFamily) return;
    setDeleting(true);
    try {
      await budgetApi.delete(deleteTarget.id, activeFamily.id);
      toast.success('Budget deleted');
      setDeleteTarget(null);
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditData(null);
    fetchBudgets();
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return budgets;
    return budgets.filter((b) => b.status === filter);
  }, [budgets, filter]);

  const filterCounts: Record<FilterType, number> = useMemo(() => ({
    all: budgets.length,
    safe: budgets.filter((b) => b.status === 'safe').length,
    warning: budgets.filter((b) => b.status === 'warning').length,
    danger: budgets.filter((b) => b.status === 'danger').length,
    exceeded: budgets.filter((b) => b.status === 'exceeded').length,
  }), [budgets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const totalPercent = summary?.percentUsed || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Spending Limits</h1>
          <p className="text-sm text-subtle mt-1">{monthLabel} — Set and monitor your family budgets</p>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Total Budget</p>
            <p className="text-lg font-bold text-heading">₹{(summary?.totalBudget || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Total Spent</p>
            <p className="text-lg font-bold text-heading">₹{(summary?.totalSpent || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Alerts</p>
            <p className="text-lg font-bold text-heading">{summary?.warningCount || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger-500/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Over Budget</p>
            <p className="text-lg font-bold text-heading">{summary?.overBudgetCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {budgets.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-heading">Overall Budget Usage</h2>
            <span className="text-sm font-bold text-heading">{totalPercent}%</span>
          </div>
          <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalPercent > 100 ? 'bg-danger-500' : totalPercent > 80 ? 'bg-accent-500' : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            ₹{(summary?.totalSpent || 0).toLocaleString('en-IN')} spent of ₹{(summary?.totalBudget || 0).toLocaleString('en-IN')} — ₹{(summary?.totalRemaining || 0).toLocaleString('en-IN')} remaining
          </p>
        </div>
      )}

      {/* Filters */}
      {budgets.length > 0 && (
        <div className="flex items-center gap-2">
          {(['all', 'safe', 'warning', 'danger', 'exceeded'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-card border border-border text-subtle hover:text-heading hover:bg-surface'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              <span className={`ml-1.5 ${filter === f ? 'text-white/70' : 'text-muted'}`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Budget Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((budget) => {
            const Icon = CATEGORY_ICONS[budget.category] || Tag;
            const colorCls = CATEGORY_COLORS[budget.category] || 'bg-gray-100 text-gray-600';
            const statusCfg = STATUS_CONFIG[budget.status];
            const StatusIcon = statusCfg.icon;
            const barWidth = Math.min(budget.percentUsed, 100);

            return (
              <div key={budget.id} className="bg-card border border-border rounded-xl p-5 group hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorCls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-heading">{budget.category}</h3>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditData(budget); setModalOpen(true); }}
                      className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(budget)}
                      className="p-1 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-xs text-subtle">
                    ₹{budget.spent.toLocaleString('en-IN')} <span className="text-muted">of</span> ₹{budget.limit.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-sm font-bold ${budget.percentUsed > 90 ? 'text-danger-600' : budget.percentUsed > 70 ? 'text-accent-600' : 'text-heading'}`}>
                    {budget.percentUsed}%
                  </p>
                </div>

                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${statusCfg.barColor}`} style={{ width: `${barWidth}%` }} />
                </div>

                <p className={`text-xs mt-2 ${budget.remaining < 0 ? 'text-danger-600 font-medium' : 'text-muted'}`}>
                  {budget.remaining < 0
                    ? `Exceeded by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}`
                    : `₹${budget.remaining.toLocaleString('en-IN')} remaining`
                  }
                </p>
              </div>
            );
          })}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Wallet className="w-10 h-10 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-heading mb-1">No budgets yet</h3>
          <p className="text-sm text-subtle mb-4">Create your first budget to start tracking spending limits</p>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Create Budget
          </button>
        </div>
      ) : (
        <div className="col-span-full flex items-center justify-center py-16 text-sm text-muted">
          No budgets match this filter
        </div>
      )}

      {/* Modals */}
      <CreateBudgetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSuccess={handleSuccess}
        editData={editData}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Delete budget?"
        message={`Delete the "${deleteTarget?.category}" budget? This won't delete any expenses.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
