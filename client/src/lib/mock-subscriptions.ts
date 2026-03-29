export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  _id: string;
  name: string;
  amount: number;
  category: string;
  billingCycle: BillingCycle;
  dueDate: number;
  nextDueDate: string;
  isActive: boolean;
  autoDebit: boolean;
  notes?: string;
}

export const mockSubscriptions: Subscription[] = [
  {
    _id: '1',
    name: 'Netflix',
    amount: 649,
    category: 'Entertainment',
    billingCycle: 'monthly',
    dueDate: 26,
    nextDueDate: '2026-03-26',
    isActive: true,
    autoDebit: true,
  },
  {
    _id: '2',
    name: 'Internet',
    amount: 999,
    category: 'Bills & Utilities',
    billingCycle: 'monthly',
    dueDate: 1,
    nextDueDate: '2026-04-01',
    isActive: true,
    autoDebit: true,
  },
  {
    _id: '3',
    name: 'Gym Membership',
    amount: 2000,
    category: 'Health & Medical',
    billingCycle: 'monthly',
    dueDate: 29,
    nextDueDate: '2026-03-29',
    isActive: true,
    autoDebit: false,
  },
  {
    _id: '4',
    name: 'Spotify',
    amount: 119,
    category: 'Entertainment',
    billingCycle: 'monthly',
    dueDate: 5,
    nextDueDate: '2026-04-05',
    isActive: true,
    autoDebit: true,
  },
  {
    _id: '5',
    name: 'Cloud Storage',
    amount: 130,
    category: 'Bills & Utilities',
    billingCycle: 'monthly',
    dueDate: 10,
    nextDueDate: '2026-04-10',
    isActive: true,
    autoDebit: true,
    notes: 'Google One 100GB plan',
  },
  {
    _id: '6',
    name: 'Insurance Premium',
    amount: 12000,
    category: 'Insurance',
    billingCycle: 'yearly',
    dueDate: 1,
    nextDueDate: '2027-03-01',
    isActive: true,
    autoDebit: false,
    notes: 'Term life insurance',
  },
  {
    _id: '7',
    name: 'Amazon Prime',
    amount: 1499,
    category: 'Entertainment',
    billingCycle: 'yearly',
    dueDate: 15,
    nextDueDate: '2026-09-15',
    isActive: true,
    autoDebit: true,
  },
  {
    _id: '8',
    name: 'Old Streaming Service',
    amount: 299,
    category: 'Entertainment',
    billingCycle: 'monthly',
    dueDate: 20,
    nextDueDate: '2026-03-20',
    isActive: false,
    autoDebit: false,
    notes: 'Cancelled in February',
  },
];

export function getDaysUntilDue(nextDueDate: string): number {
  const today = new Date('2026-03-24');
  const due = new Date(nextDueDate);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      return sum;
    }, 0);
}
