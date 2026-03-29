export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

export interface Budget {
  _id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
}

export interface BudgetWithStatus extends Budget {
  remainingAmount: number;
  percentUsed: number;
  status: BudgetStatus;
}

function getStatus(percent: number): BudgetStatus {
  if (percent > 100) return 'exceeded';
  if (percent > 90) return 'danger';
  if (percent > 70) return 'warning';
  return 'safe';
}

export function enrichBudget(b: Budget): BudgetWithStatus {
  const percentUsed = Math.round((b.spentAmount / b.budgetAmount) * 100);
  return {
    ...b,
    remainingAmount: b.budgetAmount - b.spentAmount,
    percentUsed,
    status: getStatus(percentUsed),
  };
}

export const mockBudgets: Budget[] = [
  { _id: '1', category: 'Food & Dining', budgetAmount: 8000, spentAmount: 6500, month: 3, year: 2026 },
  { _id: '2', category: 'Travel', budgetAmount: 3000, spentAmount: 350, month: 3, year: 2026 },
  { _id: '3', category: 'Shopping', budgetAmount: 5000, spentAmount: 2500, month: 3, year: 2026 },
  { _id: '4', category: 'Bills & Utilities', budgetAmount: 3000, spentAmount: 2648, month: 3, year: 2026 },
  { _id: '5', category: 'Entertainment', budgetAmount: 2000, spentAmount: 1200, month: 3, year: 2026 },
  { _id: '6', category: 'Groceries', budgetAmount: 6000, spentAmount: 3200, month: 3, year: 2026 },
  { _id: '7', category: 'Health & Medical', budgetAmount: 2000, spentAmount: 500, month: 3, year: 2026 },
  { _id: '8', category: 'Rent', budgetAmount: 12000, spentAmount: 12000, month: 3, year: 2026 },
  { _id: '9', category: 'Education', budgetAmount: 1500, spentAmount: 1600, month: 3, year: 2026 },
];
