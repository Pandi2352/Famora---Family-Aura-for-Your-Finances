import { useState, useEffect, useCallback } from 'react';
import {
  Target, Plus, TrendingUp, Trophy, Clock, Pencil, Trash2,
  Loader2, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { goalApi } from '../../lib/api/goal.api';
import type { GoalItem, GoalSummary } from '../../lib/api/goal.api';
import { useFamilyStore } from '../../stores/family.store';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CreateGoalModal from './CreateGoalModal';
import ContributeModal from './ContributeModal';

function fmt(v: number) { return `₹${v.toLocaleString('en-IN')}`; }

export default function GoalsPage() {
  const { activeFamily } = useFamilyStore();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editData, setEditData] = useState<GoalItem | null>(null);
  const [contributeGoal, setContributeGoal] = useState<GoalItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GoalItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        goalApi.list(activeFamily.id),
        goalApi.summary(activeFamily.id),
      ]);
      setGoals(listRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [activeFamily]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleDelete = async () => {
    if (!deleteTarget || !activeFamily) return;
    setDeleting(true);
    try {
      await goalApi.delete(deleteTarget.id, activeFamily.id);
      toast.success('Goal deleted');
      setDeleteTarget(null);
      fetchGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = () => {
    setCreateOpen(false);
    setEditData(null);
    setContributeGoal(null);
    fetchGoals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Goals Vault</h1>
          <p className="text-sm text-subtle mt-1">Track progress toward your family's financial goals</p>
        </div>
        <button onClick={() => { setEditData(null); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Total Target</p>
            <p className="text-lg font-bold text-heading">{fmt(summary?.totalTarget || 0)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Total Saved</p>
            <p className="text-lg font-bold text-heading">{fmt(summary?.totalSaved || 0)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Progress</p>
            <p className="text-lg font-bold text-heading">{summary?.overallPercent || 0}%</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-subtle">Completed</p>
            <p className="text-lg font-bold text-heading">{summary?.completedCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Active Goals Grid */}
      {activeGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={() => setContributeGoal(goal)}
              onEdit={() => { setEditData(goal); setCreateOpen(true); }}
              onDelete={() => setDeleteTarget(goal)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target className="w-10 h-10 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-heading mb-1">No active goals</h3>
          <p className="text-sm text-subtle mb-4">Create your first savings target to start tracking</p>
          <button onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <h2 className="text-sm font-semibold text-heading">Completed Goals</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="bg-card border border-border rounded-xl p-5 opacity-75">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-heading">{goal.title}</h3>
                    <span className="text-xs text-success-600 font-medium">Completed</span>
                  </div>
                </div>
                <p className="text-sm text-heading font-medium">{fmt(goal.savedAmount)} / {fmt(goal.targetAmount)}</p>
                {goal.completedAt && (
                  <p className="text-xs text-muted mt-1">
                    {new Date(goal.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateGoalModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditData(null); }}
        onSuccess={handleSuccess}
        editData={editData}
      />
      <ContributeModal
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSuccess={handleSuccess}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Delete goal?"
        message={`Delete "${deleteTarget?.title}"? All contribution history will be lost.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ── Circular Progress ── */
function CircularProgress({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-heading">{percent}%</span>
      </div>
    </div>
  );
}

/* ── Goal Card ── */
function GoalCard({ goal, onContribute, onEdit, onDelete }: {
  goal: GoalItem;
  onContribute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const deadlineText = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  const priorityColors: Record<string, string> = {
    high: 'text-danger-600 bg-danger-500/10',
    medium: 'text-accent-600 bg-accent-500/10',
    low: 'text-subtle bg-surface',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 group hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-heading">{goal.title}</h3>
          {goal.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{goal.description}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center my-4">
        <CircularProgress percent={goal.percent} color={goal.color} />
      </div>

      {/* Amounts */}
      <div className="text-center mb-3">
        <p className="text-sm font-semibold text-heading">
          {fmt(goal.savedAmount)} <span className="text-muted font-normal">of</span> {fmt(goal.targetAmount)}
        </p>
        <p className="text-xs text-muted mt-0.5">{fmt(goal.remaining)} to go</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {deadlineText && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock className="w-3 h-3" /> {deadlineText}
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${priorityColors[goal.priority]}`}>
            {goal.priority}
          </span>
        </div>
        <button onClick={onContribute}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-colors">
          <Plus className="w-3 h-3" /> Contribute
        </button>
      </div>
    </div>
  );
}
