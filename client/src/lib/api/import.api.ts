import { api } from './client';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  original: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  fileName: string;
  totalCount: number;
  incomeCount: number;
  expenseCount: number;
}

export const importApi = {
  parse: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; data: ParseResult }>('/import/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirm: (familyId: string, transactions: ParsedTransaction[]) =>
    api.post<{ success: boolean; data: { imported: number; total: number } }>(
      '/import/confirm',
      { familyId, transactions },
    ),
};
