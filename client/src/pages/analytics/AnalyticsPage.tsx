import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, Percent, BarChart3,
  Loader2, Users, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import { expenseApi } from '../../lib/api/expense.api';
import type { MonthlySummary, ExpenseItem } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';

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

export default function AnalyticsPage() {
  const { activeFamily } = useFamilyStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [trends, setTrends] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; total: number; count: number }[]>([]);
  const [daily, setDaily] = useState<{ day: number; amount: number }[]>([]);
  const [memberComp, setMemberComp] = useState<{ name: string; total: number; count: number; relationship: string }[]>([]);
  const [topExpenses, setTopExpenses] = useState<ExpenseItem[]>([]);

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
      expenseApi.memberComparison(fId, year, month),
      expenseApi.topExpenses(fId, year, month, 5),
    ])
      .then(([sumR, trendR, catR, dailyR, memR, topR]) => {
        setSummary(sumR.data.data);
        setTrends(trendR.data.data);
        setCategories(catR.data.data);
        setDaily(dailyR.data.data);
        setMemberComp(memR.data.data);
        setTopExpenses(topR.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
  const txCount = summary?.transactionCount || 0;
  const avgDaily = daily.length > 0
    ? Math.round(daily.reduce((s, d) => s + d.amount, 0) / daily.filter((d) => d.amount > 0).length || 1)
    : 0;

  const pieData = categories.map((c) => ({ name: c._id, value: c.total }));
  const totalCatSpend = categories.reduce((s, c) => s + c.total, 0);

  const stats = [
    { label: 'Income', value: fmt(totalIncome), icon: TrendingUp, bg: 'bg-success-500/10', color: 'text-success-600' },
    { label: 'Expenses', value: fmt(totalExpenses), icon: TrendingDown, bg: 'bg-danger-500/10', color: 'text-danger-600' },
    { label: 'Net Savings', value: fmt(netSavings), icon: Wallet, bg: 'bg-primary-500/10', color: 'text-primary-600' },
    { label: 'Savings Rate', value: `${savingsRate}%`, icon: Percent, bg: 'bg-accent-500/10', color: 'text-accent-600' },
    { label: 'Transactions', value: String(txCount), icon: BarChart3, bg: 'bg-violet-100', color: 'text-violet-600' },
    { label: 'Avg Daily', value: fmt(avgDaily), icon: ArrowDownLeft, bg: 'bg-pink-100', color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-heading">Insights</h1>
        <p className="text-sm text-subtle mt-1">{monthLabel} — Your family's financial analysis</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg} mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-lg font-bold text-heading">{s.value}</p>
            <p className="text-[10px] text-muted font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expense Trends */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-heading mb-4">Income vs Expenses (6 Months)</h2>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trends} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART.text }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income" name="Income" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Expense" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-xs text-muted">No data yet</div>
        )}
      </div>

      {/* Category Pie + Daily Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-heading mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-[200px] h-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categories.map((c, i) => (
                  <div key={c._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs font-medium text-heading truncate max-w-[120px]">{c._id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-heading">{fmt(c.total)}</span>
                      <span className="text-[10px] text-muted ml-1.5">
                        {totalCatSpend > 0 ? Math.round((c.total / totalCatSpend) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No expense data</div>
          )}
        </div>

        {/* Daily Spending */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-heading">Daily Spending</h2>
            <span className="text-xs text-muted">Avg: {fmt(avgDaily)}/day</span>
          </div>
          {daily.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: CHART.text }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: CHART.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={(l) => `Day ${l}`} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-xs text-muted">No spending data</div>
          )}
        </div>
      </div>

      {/* Member Comparison + Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Member Spending */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-semibold text-heading">Who Spent What</h2>
          </div>
          {memberComp.length > 0 ? (
            <div className="space-y-4">
              {memberComp.map((m, i) => {
                const maxTotal = memberComp[0]?.total || 1;
                const pct = Math.round((m.total / maxTotal) * 100);
                return (
                  <div key={m.name + i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                          {m.name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-heading">{m.name}</span>
                          {m.relationship !== 'other' && (
                            <span className="text-[10px] text-muted capitalize ml-1">({m.relationship})</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-heading">{fmt(m.total)}</span>
                        <span className="text-[10px] text-muted ml-1">{m.count} txns</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No data yet</div>
          )}
        </div>

        {/* Top Expenses */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-4 h-4 text-danger-600" />
            <h2 className="text-sm font-semibold text-heading">Top Expenses This Month</h2>
          </div>
          {topExpenses.length > 0 ? (
            <div className="space-y-3">
              {topExpenses.map((tx, i) => (
                <div key={tx.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-[10px] font-bold text-muted">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-heading">{tx.category}</p>
                      <p className="text-[10px] text-muted">
                        {tx.creatorName} {tx.note ? `• ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-danger-600">{fmt(tx.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-xs text-muted">No expenses yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
