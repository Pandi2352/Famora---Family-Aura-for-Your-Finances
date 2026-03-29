import { api } from './client';

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

export interface BudgetItem {
  id: string;
  familyId: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
  month: number;
  year: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
  budgetCount: number;
  overBudgetCount: number;
  warningCount: number;
}

export interface CreateBudgetPayload {
  category: string;
  limit: number;
  month: number;
  year: number;
  familyId: string;
}

export interface UpdateBudgetPayload {
  limit?: number;
  category?: string;
}

export const budgetApi = {
  list: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: BudgetItem[] }>('/budgets', {
      params: { familyId, year, month },
    }),

  summary: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: BudgetSummary }>('/budgets/summary', {
      params: { familyId, year, month },
    }),

  create: (data: CreateBudgetPayload) =>
    api.post<{ success: boolean; data: BudgetItem }>('/budgets', data),

  update: (id: string, familyId: string, data: UpdateBudgetPayload) =>
    api.patch<{ success: boolean; data: BudgetItem }>(`/budgets/${id}?familyId=${familyId}`, data),

  delete: (id: string, familyId: string) =>
    api.delete(`/budgets/${id}?familyId=${familyId}`),
};
