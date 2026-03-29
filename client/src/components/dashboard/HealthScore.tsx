import { useState, useEffect } from 'react';
import { HeartPulse, TrendingUp, Wallet, Target, CalendarCheck, Loader2 } from 'lucide-react';
import { expenseApi } from '../../lib/api/expense.api';
import type { HealthScore as HealthScoreType } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';

const LABEL_COLORS: Record<string, string> = {
  'Excellent': 'text-success-600',
  'Good': 'text-primary-600',
  'Fair': 'text-accent-600',
  'Needs Work': 'text-danger-600',
};

const GAUGE_COLORS: Record<string, string> = {
  'Excellent': '#22c55e',
  'Good': '#6366f1',
  'Fair': '#f59e0b',
  'Needs Work': '#ef4444',
};

const BREAKDOWN_ITEMS = [
  { key: 'savings' as const, label: 'Savings', icon: TrendingUp, color: '#22c55e' },
  { key: 'budget' as const, label: 'Budgets', icon: Wallet, color: '#6366f1' },
  { key: 'goals' as const, label: 'Goals', icon: Target, color: '#f59e0b' },
  { key: 'consistency' as const, label: 'Consistency', icon: CalendarCheck, color: '#8b5cf6' },
];

export default function HealthScoreWidget() {
  const { activeFamily } = useFamilyStore();
  const [data, setData] = useState<HealthScoreType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeFamily) return;
    const now = new Date();
    setLoading(true);
    expenseApi.healthScore(activeFamily.id, now.getFullYear(), now.getMonth() + 1)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFamily]);

  useEffect(() => {
    const handler = () => {
      if (!activeFamily) return;
      const now = new Date();
      expenseApi.healthScore(activeFamily.id, now.getFullYear(), now.getMonth() + 1)
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

  if (!data) return null;

  const gaugeColor = GAUGE_COLORS[data.label] || '#6366f1';
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="w-4 h-4 text-primary-600" />
        <h2 className="text-sm font-semibold text-heading">Financial Health</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={gaugeColor} strokeWidth={strokeWidth}
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-heading">{data.score}</span>
            <span className={`text-[10px] font-bold ${LABEL_COLORS[data.label]}`}>{data.label}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2.5">
          {BREAKDOWN_ITEMS.map((item) => {
            const val = data.breakdown[item.key];
            return (
              <div key={item.key} className="flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5 text-muted shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-medium text-subtle">{item.label}</span>
                    <span className="text-[10px] font-bold text-heading">{val}</span>
                  </div>
                  <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${val}%`, background: item.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
