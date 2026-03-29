import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, HeartHandshake, Percent,
  ArrowUpRight, ArrowDownLeft, ArrowRight, Plus, Loader2,
  Utensils, Car, Home, Zap, ShoppingBag, ShoppingCart, Tag,
  CreditCard, Smartphone, Landmark, Banknote, CircleDot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { expenseApi } from '../../lib/api/expense.api';
import type { MonthlySummary, ExpenseItem } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';
import { useAuthStore } from '../../stores/auth.store';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import HealthScoreWidget from '../../components/dashboard/HealthScore';
import MonthComparisonWidget from '../../components/dashboard/MonthComparison';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Dining': Utensils, 'Travel & Transport': Car, 'Rent & Housing': Home,
  'Bills & Utilities': Zap, 'Shopping': ShoppingBag, 'Groceries': ShoppingCart,
};
const PAYMENT_ICONS: Record<string, LucideIcon> = {
  cash: Banknote, card: CreditCard, upi: Smartphone, bank_transfer: Landmark, other: CircleDot,
};

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const CHART = { income: '#22c55e', expense: '#ef4444', grid: '#e2e8f0', text: '#94a3b8' };

function fmt(v: number) { return `₹${v.toLocaleString('en-IN')}`; }

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-md px-3 py-2">
      <p className="text-xs font-medium text-heading mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { activeFamily } = useFamilyStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [trends, setTrends] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; total: number }[]>([]);
  const [daily, setDaily] = useState<{ day: number; amount: number }[]>([]);
  const [recent, setRecent] = useState<ExpenseItem[]>([]);
  const [memberComp, setMemberComp] = useState<{ name: string; total: number; relationship: string }[]>([]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!activeFamily) return;
    const fId = activeFamily.id;

    setLoading(true);
    Promise.all([
      expenseApi.summary(fId, year, month),
      expenseApi.trends(fId, 6),
      expenseApi.categories(fId, year, month),
      expenseApi.daily(fId, year, month),
      expenseApi.recent(fId, 5),
      expenseApi.memberComparison(fId, year, month),
    ])
      .then(([sumRes, trendRes, catRes, dailyRes, recentRes, memRes]) => {
        setSummary(sumRes.data.data);
        setTrends(trendRes.data.data);
        setCategories(catRes.data.data);
        setDaily(dailyRes.data.data);
        setRecent(recentRes.data.data);
        setMemberComp(memRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeFamily]);

  // Refresh when expenses change
  useEffect(() => {
    const handler = () => {
      if (!activeFamily) return;
      const fId = activeFamily.id;
      Promise.all([
        expenseApi.summary(fId, year, month),
        expenseApi.recent(fId, 5),
        expenseApi.categories(fId, year, month),
        expenseApi.memberComparison(fId, year, month),
      ]).then(([s, r, c, m]) => {
        setSummary(s.data.data);
        setRecent(r.data.data);
        setCategories(c.data.data);
        setMemberComp(m.data.data);
      }).catch(() => {});
    };
    window.addEventListener('balance-refresh', handler);
    return () => window.removeEventListener('balance-refresh', handler);
  }, [activeFamily]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netSavings = summary?.netSavings || 0;
  const savingsRate = summary?.savingsRate || 0;

  const stats = [
    { label: 'Income', value: fmt(totalIncome), icon: TrendingUp, iconBg: 'bg-success-500/10', iconColor: 'text-success-600' },
    { label: 'Expenses', value: fmt(totalExpenses), icon: TrendingDown, iconBg: 'bg-danger-500/10', iconColor: 'text-danger-600' },
    { label: 'Net Savings', value: fmt(netSavings), icon: HeartHandshake, iconBg: 'bg-primary-500/10', iconColor: 'text-primary-600' },
    { label: 'Savings Rate', value: `${savingsRate}%`, icon: Percent, iconBg: 'bg-accent-500/10', iconColor: 'text-accent-600' },
  ];

  const pieData = categories.map((c) => ({ name: c._id, value: c.total }));
  const totalCatSpend = categories.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Family Hub</h1>
          <p className="text-sm text-subtle mt-1">
            {activeFamily?.name} — {monthLabel} overview
          </p>
        </div>
        <Link
          to="/transactions"
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-subtle">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-heading">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trends */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Income vs Expenses</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trends} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART.text }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" name="Income" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expense" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-xs text-muted">Add transactions to see trends</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categories.slice(0, 5).map((c, i) => (
                  <div key={c._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-heading font-medium">{c._id}</span>
                    </div>
                    <span className="text-muted">{totalCatSpend > 0 ? Math.round((c.total / totalCatSpend) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-xs text-muted">No expense data yet</div>
          )}
        </div>
      </div>

      {/* Daily Spending + Member Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Spending */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Daily Spending</h2>
          {daily.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: CHART.text }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: CHART.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No spending data for this month</div>
          )}
        </div>

        {/* Member Comparison */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Who Spent What</h2>
          {memberComp.length > 0 ? (
            <div className="space-y-3">
              {memberComp.map((m, i) => {
                const maxTotal = memberComp[0]?.total || 1;
                const pct = Math.round((m.total / maxTotal) * 100);
                return (
                  <div key={m.name + i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-heading">{m.name}</span>
                        {m.relationship !== 'other' && (
                          <span className="text-[10px] text-muted capitalize">({m.relationship})</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-heading">{fmt(m.total)}</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No spending data yet</div>
          )}
        </div>
      </div>

      {/* Health Score + Month Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HealthScoreWidget />
        <MonthComparisonWidget />
      </div>

      {/* Recent Transactions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-heading">Recent Transactions</h2>
            <Link to="/transactions" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="space-y-2">
              {recent.map((tx) => {
                const Icon = CATEGORY_ICONS[tx.category] || Tag;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-success-500/10' : 'bg-danger-500/10'
                      }`}>
                        {tx.type === 'income'
                          ? <ArrowDownLeft className="w-4 h-4 text-success-600" />
                          : <Icon className="w-4 h-4 text-danger-600" />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-medium text-heading">{tx.category}</p>
                        <p className="text-[10px] text-muted">{tx.creatorName} {tx.note ? `• ${tx.note}` : ''}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No transactions yet</div>
          )}
        </div>

        {/* Family Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}
