export const monthlySummary = {
  totalIncome: 85000,
  totalExpenses: 42000,
  netSavings: 43000,
  savingsRate: 50.6,
  topCategory: 'Food & Dining',
  transactionCount: 47,
  avgDailySpend: 1400,
};

export const monthlyTrends = [
  { month: 'Oct', income: 62000, expense: 38000 },
  { month: 'Nov', income: 65000, expense: 41000 },
  { month: 'Dec', income: 70000, expense: 52000 },
  { month: 'Jan', income: 68000, expense: 39000 },
  { month: 'Feb', income: 72000, expense: 44000 },
  { month: 'Mar', income: 85000, expense: 42000 },
];

export const categoryBreakdown = [
  { category: 'Food & Dining', amount: 8500, color: '#f97316' },
  { category: 'Rent', amount: 12000, color: '#8b5cf6' },
  { category: 'Bills & Utilities', amount: 4600, color: '#eab308' },
  { category: 'Shopping', amount: 3800, color: '#f43f5e' },
  { category: 'Groceries', amount: 5200, color: '#22c55e' },
  { category: 'Travel', amount: 2100, color: '#3b82f6' },
  { category: 'Entertainment', amount: 2800, color: '#ec4899' },
  { category: 'Health', amount: 1500, color: '#ef4444' },
  { category: 'Education', amount: 1500, color: '#6366f1' },
];

export const dailySpending = [
  { day: '1', amount: 1200 },
  { day: '2', amount: 800 },
  { day: '3', amount: 2500 },
  { day: '4', amount: 600 },
  { day: '5', amount: 12400 },
  { day: '6', amount: 350 },
  { day: '7', amount: 900 },
  { day: '8', amount: 1800 },
  { day: '9', amount: 450 },
  { day: '10', amount: 2100 },
  { day: '11', amount: 700 },
  { day: '12', amount: 3200 },
  { day: '13', amount: 500 },
  { day: '14', amount: 1100 },
  { day: '15', amount: 1650 },
  { day: '16', amount: 800 },
  { day: '17', amount: 400 },
  { day: '18', amount: 2200 },
  { day: '19', amount: 650 },
  { day: '20', amount: 3500 },
  { day: '21', amount: 900 },
  { day: '22', amount: 1500 },
  { day: '23', amount: 750 },
  { day: '24', amount: 1050 },
];

export const topExpenses = [
  { category: 'Rent', amount: 12000, percent: 28.6, change: 0 },
  { category: 'Food & Dining', amount: 8500, percent: 20.2, change: 12 },
  { category: 'Groceries', amount: 5200, percent: 12.4, change: -5 },
  { category: 'Bills & Utilities', amount: 4600, percent: 11.0, change: 3 },
  { category: 'Shopping', amount: 3800, percent: 9.0, change: 25 },
];

export const smartInsights = [
  { type: 'warning' as const, message: 'You spent 35% more on Food this month compared to last month.' },
  { type: 'success' as const, message: 'Your savings rate improved by 5% this month — great work!' },
  { type: 'success' as const, message: 'Travel expenses decreased by 20% — keep it up!' },
  { type: 'info' as const, message: "You've saved enough this month to contribute ₹5,000 to your Bike goal." },
  { type: 'warning' as const, message: 'Shopping spending is up 25% — consider setting a tighter budget.' },
];
