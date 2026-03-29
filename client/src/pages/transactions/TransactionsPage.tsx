import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  SmilePlus,
  Pin,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { expenseApi, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/api/expense.api';
import type { ExpenseItem, ExpenseListResponse, MonthlySummary } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';
import { useAuthStore } from '../../stores/auth.store';
import Dropdown from '../../components/ui/Dropdown';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AddTransactionModal from './AddTransactionModal';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .map((c) => ({ value: c, label: c })),
];

export default function TransactionsPage() {
  const { activeFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ExpenseListResponse | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [addOpen, setAddOpen] = useState(() => searchParams.get('add') === 'true');
  const [editData, setEditData] = useState<ExpenseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const now = new Date();

  const fetchExpenses = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        expenseApi.list({
          familyId: activeFamily.id,
          type: typeFilter || undefined,
          category: categoryFilter || undefined,
          search: search || undefined,
          page,
          limit: 10,
          sortBy: 'date',
          sortOrder: 'desc',
        }),
        expenseApi.summary(activeFamily.id, now.getFullYear(), now.getMonth() + 1),
      ]);
      setData(expRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [activeFamily, typeFilter, categoryFilter, search, page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async () => {
    if (!deleteTarget || !activeFamily) return;
    setDeleting(true);
    try {
      await expenseApi.delete(deleteTarget.id, activeFamily.id);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      fetchExpenses();
      window.dispatchEvent(new Event('balance-refresh'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    setAddOpen(false);
    setEditData(null);
    searchParams.delete('add');
    setSearchParams(searchParams, { replace: true });
    fetchExpenses();
    window.dispatchEvent(new Event('balance-refresh'));
  };

  const REACTION_EMOJIS = ['👍', '❓', '😱', '🔥', '❤️', '😂'];
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);

  const handleReaction = async (expenseId: string, emoji: string) => {
    if (!activeFamily) return;
    try {
      const res = await expenseApi.react(expenseId, activeFamily.id, emoji);
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          expenses: prev.expenses.map((e) =>
            e.id === expenseId ? { ...e, reactions: res.data.data.reactions } : e,
          ),
        };
      });
      setReactionPickerFor(null);
    } catch {
      toast.error('Failed to react');
    }
  };

  const handlePin = async (expenseId: string) => {
    if (!activeFamily) return;
    try {
      const res = await expenseApi.togglePin(expenseId, activeFamily.id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          expenses: prev.expenses.map((e) =>
            e.id === expenseId ? { ...e, isPinned: res.data.data.isPinned } : e,
          ),
        };
      });
      toast.success(res.data.data.isPinned ? 'Pinned' : 'Unpinned');
    } catch {
      toast.error('Failed to pin');
    }
  };

  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Money Flow</h1>
          <p className="text-sm text-subtle mt-1">Track your family's income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!activeFamily) return;
              expenseApi.exportCsv(activeFamily.id).then((res) => {
                const url = URL.createObjectURL(res.data as any);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'famora-expenses.csv';
                a.click();
                URL.revokeObjectURL(url);
                toast.success('CSV downloaded');
              }).catch(() => toast.error('Export failed'));
            }}
            className="flex items-center gap-2 px-3 py-2 border border-border text-sm font-medium text-subtle rounded-lg hover:text-heading hover:bg-surface transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => { setEditData(null); setAddOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Income</p>
            <p className="text-lg font-bold text-heading">₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger-500/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Expenses</p>
            <p className="text-lg font-bold text-heading">₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Net Balance</p>
            <p className={`text-lg font-bold ${(summary?.netSavings || 0) >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              ₹{(summary?.netSavings || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Dropdown options={TYPE_OPTIONS} value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} placeholder="All Types" label="Type" />
        </div>
        <div className="w-48">
          <Dropdown options={CATEGORY_OPTIONS} value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setPage(1); }} placeholder="All Categories" label="Category" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-subtle mb-1.5">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : data?.expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="w-10 h-10 text-muted mb-3" />
            <p className="text-sm font-medium text-heading mb-1">No transactions found</p>
            <p className="text-xs text-muted">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3 hidden lg:table-cell">Note</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3 hidden md:table-cell">Added By</th>
                  <th className="text-left text-xs font-medium text-subtle px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-subtle px-5 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-subtle px-5 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.expenses.map((exp) => (
                  <tr key={exp.id} className={`border-b border-border last:border-b-0 hover:bg-surface/30 transition-colors group ${
                    exp.isPinned ? 'bg-accent-500/[0.03]' : ''
                  }`}>
                    <td className="px-5 py-3">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          exp.type === 'income' ? 'bg-success-500/10' : 'bg-danger-500/10'
                        }`}>
                          {exp.type === 'income'
                            ? <ArrowDownLeft className="w-4 h-4 text-success-600" />
                          : <ArrowUpRight className="w-4 h-4 text-danger-600" />
                        }
                        </div>
                        {exp.isPinned && (
                          <Pin className="absolute -top-1 -right-1 w-3 h-3 text-accent-500 fill-accent-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-heading">{exp.category}</p>
                      <p className="text-xs text-muted capitalize">{exp.paymentMethod.replace('_', ' ')}</p>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <p className="text-sm text-subtle truncate max-w-[200px]">{exp.note || '—'}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-sm font-medium text-heading">{exp.creatorName}</p>
                      <p className="text-[10px] text-muted capitalize">{exp.creatorRelationship === 'other' ? '' : exp.creatorRelationship}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="text-sm text-subtle">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-sm font-bold ${exp.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                        {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN')}
                      </span>
                      {/* Reactions display */}
                      {exp.reactions?.length > 0 && (
                        <div className="flex items-center justify-end gap-0.5 mt-1">
                          {Object.entries(
                            exp.reactions.reduce<Record<string, number>>((acc, r) => {
                              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                              return acc;
                            }, {}),
                          ).map(([emoji, count]) => {
                            const myReaction = exp.reactions.some(
                              (r) => r.userId === user?.id && r.emoji === emoji,
                            );
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(exp.id, emoji)}
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                                  myReaction
                                    ? 'bg-primary-500/15 ring-1 ring-primary-500/30'
                                    : 'bg-surface hover:bg-primary-500/10'
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 1 && <span className="text-muted font-medium">{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Pin */}
                        <button
                          onClick={() => handlePin(exp.id)}
                          className={`p-1.5 rounded transition-colors ${
                            exp.isPinned
                              ? 'text-accent-500 bg-accent-500/10'
                              : 'text-muted hover:text-accent-500 hover:bg-surface'
                          }`}
                          title={exp.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${exp.isPinned ? 'fill-current' : ''}`} />
                        </button>
                        {/* Reaction picker */}
                        <div className="relative">
                          <button
                            onClick={() => setReactionPickerFor(reactionPickerFor === exp.id ? null : exp.id)}
                            className="p-1.5 rounded hover:bg-surface text-muted hover:text-heading transition-colors"
                            title="React"
                          >
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>
                          {reactionPickerFor === exp.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setReactionPickerFor(null)} />
                              <div className="absolute right-0 bottom-full mb-1 z-40 bg-card border border-border rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(exp.id, emoji)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-base hover:scale-125 transition-all"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => { setEditData(exp); setAddOpen(true); }}
                          className="p-1.5 rounded hover:bg-surface text-muted hover:text-heading transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors"
                          title="Delete"
                        >
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/30">
            <p className="text-xs text-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-surface text-muted hover:text-heading disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-heading px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded hover:bg-surface text-muted hover:text-heading disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditData(null); }}
        onSuccess={handleSuccess}
        editData={editData ? {
          id: editData.id,
          type: editData.type,
          amount: editData.amount,
          category: editData.category,
          note: editData.note,
          date: editData.date,
          paymentMethod: editData.paymentMethod,
        } : null}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Delete transaction?"
        message={`Delete ${deleteTarget?.category} — ₹${deleteTarget?.amount.toLocaleString('en-IN')}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
