export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Travel',
  'Rent',
  'Bills & Utilities',
  'Entertainment',
  'Shopping',
  'Health & Medical',
  'Education',
  'Groceries',
  'Personal Care',
  'Investments',
  'Custom',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other',
] as const;

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  tags: string[];
}
