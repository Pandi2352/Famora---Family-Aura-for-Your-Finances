import { api } from './client';

export interface ExpenseReaction {
  userId: string;
  emoji: string;
}

export interface ExpenseItem {
  id: string;
  familyId: string;
  createdBy: string;
  creatorName: string;
  creatorRelationship: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod: string;
  reactions: ExpenseReaction[];
  isPinned: boolean;
  receiptUrl: string | null;
  createdAt: string;
}

export interface MonthComparison {
  categories: { category: string; current: number; previous: number; change: number }[];
  totalCurrent: number;
  totalPrevious: number;
  totalChange: number;
}

export interface HealthScore {
  score: number;
  label: string;
  breakdown: {
    savings: number;
    budget: number;
    goals: number;
    consistency: number;
  };
}

export interface ExpenseListResponse {
  expenses: ExpenseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateExpensePayload {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string;
  paymentMethod?: string;
  familyId: string;
}

export interface UpdateExpensePayload {
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
  paymentMethod?: string;
}

export interface ExpenseQuery {
  familyId: string;
  type?: string;
  category?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
}

export const expenseApi = {
  list: (query: ExpenseQuery) =>
    api.get<{ success: boolean; data: ExpenseListResponse }>('/expenses', { params: query }),

  create: (data: CreateExpensePayload) =>
    api.post<{ success: boolean; data: ExpenseItem }>('/expenses', data),

  update: (id: string, familyId: string, data: UpdateExpensePayload) =>
    api.patch<{ success: boolean; data: ExpenseItem }>(`/expenses/${id}?familyId=${familyId}`, data),

  delete: (id: string, familyId: string) =>
    api.delete(`/expenses/${id}?familyId=${familyId}`),

  summary: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: MonthlySummary }>('/expenses/summary', {
      params: { familyId, year, month },
    }),

  categories: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: { _id: string; total: number; count: number }[] }>(
      '/expenses/categories',
      { params: { familyId, year, month } },
    ),

  recent: (familyId: string, limit = 5) =>
    api.get<{ success: boolean; data: ExpenseItem[] }>('/expenses/recent', {
      params: { familyId, limit },
    }),

  trends: (familyId: string, months = 6) =>
    api.get<{ success: boolean; data: { month: string; income: number; expense: number }[] }>(
      '/expenses/trends', { params: { familyId, months } },
    ),

  daily: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: { day: number; amount: number }[] }>(
      '/expenses/daily', { params: { familyId, year, month } },
    ),

  memberComparison: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: { userId: string; name: string; relationship: string; total: number; count: number }[] }>(
      '/expenses/members', { params: { familyId, year, month } },
    ),

  topExpenses: (familyId: string, year: number, month: number, limit = 5) =>
    api.get<{ success: boolean; data: ExpenseItem[] }>(
      '/expenses/top', { params: { familyId, year, month, limit } },
    ),

  comparison: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: MonthComparison }>('/expenses/comparison', {
      params: { familyId, year, month },
    }),

  healthScore: (familyId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: HealthScore }>('/expenses/health', {
      params: { familyId, year, month },
    }),

  exportCsv: (familyId: string, dateFrom?: string, dateTo?: string) => {
    const params: Record<string, string> = { familyId };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    return api.get('/expenses/export', { params, responseType: 'blob' });
  },

  uploadReceipt: (expenseId: string, familyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; data: { receiptUrl: string } }>(
      `/expenses/${expenseId}/receipt?familyId=${familyId}`, formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  today: (familyId: string) =>
    api.get<{ success: boolean; data: { total: number; count: number } }>('/expenses/today', {
      params: { familyId },
    }),

  togglePin: (expenseId: string, familyId: string) =>
    api.post<{ success: boolean; data: { isPinned: boolean } }>(
      `/expenses/${expenseId}/pin?familyId=${familyId}`,
    ),

  react: (expenseId: string, familyId: string, emoji: string) =>
    api.post<{ success: boolean; data: { reactions: ExpenseReaction[] } }>(
      `/expenses/${expenseId}/react?familyId=${familyId}`,
      { emoji },
    ),
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Travel & Transport', 'Rent & Housing', 'Bills & Utilities',
  'Entertainment', 'Shopping', 'Health & Medical', 'Education',
  'Groceries', 'Personal Care', 'Investments', 'EMI & Loans',
  'Gifts & Donations', 'Other',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investments',
  'Rental Income', 'Gifts', 'Refunds', 'Other',
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];
