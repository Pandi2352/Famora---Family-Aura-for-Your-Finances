import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Loader2 } from 'lucide-react';
import { expenseApi } from '../../lib/api/expense.api';
import type { MonthComparison as MonthComparisonType } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';

function fmt(v: number) { return `₹${v.toLocaleString('en-IN')}`; }

export default function MonthComparisonWidget() {
  const { activeFamily } = useFamilyStore();
  const [data, setData] = useState<MonthComparisonType | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevLabel = prevMonth.toLocaleDateString('en-IN', { month: 'short' });

  useEffect(() => {
    if (!activeFamily) return;
    setLoading(true);
    expenseApi.comparison(activeFamily.id, now.getFullYear(), now.getMonth() + 1)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFamily]);

  useEffect(() => {
    const handler = () => {
      if (!activeFamily) return;
      expenseApi.comparison(activeFamily.id, now.getFullYear(), now.getMonth() + 1)
        .then((res) => setData(res.data.data))
        .catch(() => {});
    };
    window.addEventListener('balance-refresh', handler);
    return () => window.removeEventListener('balance-refresh', handler);
  }, [activeFamily]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!data || data.categories.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-heading">vs Last Month</h2>
        </div>
        <p className="text-xs text-muted text-center py-6">Not enough data — need 2 months of expenses</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-semibold text-heading">vs {prevLabel}</h2>
        </div>
        {/* Overall change */}
        <div className={`flex items-center gap-1 text-xs font-bold ${
          data.totalChange > 0 ? 'text-danger-600' : data.totalChange < 0 ? 'text-success-600' : 'text-muted'
        }`}>
          {data.totalChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : data.totalChange < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {data.totalChange > 0 ? '+' : ''}{data.totalChange}% overall
        </div>
      </div>

      <div className="space-y-2.5">
        {data.categories.slice(0, 6).map((cat) => (
          <div key={cat.category} className="flex items-center justify-between">
            <span className="text-xs font-medium text-heading truncate max-w-[120px]">{cat.category}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{fmt(cat.current)}</span>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold min-w-[50px] justify-end ${
                cat.change > 0 ? 'text-danger-600' : cat.change < 0 ? 'text-success-600' : 'text-muted'
              }`}>
                {cat.change > 0 ? (
                  <><ArrowUpRight className="w-2.5 h-2.5" />+{cat.change}%</>
                ) : cat.change < 0 ? (
                  <><ArrowDownRight className="w-2.5 h-2.5" />{cat.change}%</>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
