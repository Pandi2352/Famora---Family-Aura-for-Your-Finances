export type GoalPriority = 'low' | 'medium' | 'high';

export interface Contribution {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  _id: string;
  title: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  priority: GoalPriority;
  icon: string;
  color: string;
  contributions: Contribution[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export const mockGoals: SavingsGoal[] = [
  {
    _id: '1',
    title: 'Bike Purchase',
    description: 'Royal Enfield Hunter 350',
    targetAmount: 80000,
    savedAmount: 55000,
    deadline: '2026-08-15',
    priority: 'high',
    icon: 'bike',
    color: '#6366f1',
    contributions: [
      { _id: 'c1', amount: 10000, date: '2026-03-15', note: 'March contribution' },
      { _id: 'c2', amount: 10000, date: '2026-02-15', note: 'February savings' },
      { _id: 'c3', amount: 15000, date: '2026-01-20', note: 'Bonus savings' },
      { _id: 'c4', amount: 20000, date: '2026-01-01', note: 'Initial deposit' },
    ],
    isCompleted: false,
    createdAt: '2025-12-01',
  },
  {
    _id: '2',
    title: 'Emergency Fund',
    description: '3 months of expenses safety net',
    targetAmount: 100000,
    savedAmount: 35000,
    deadline: '2026-12-31',
    priority: 'high',
    icon: 'shield',
    color: '#22c55e',
    contributions: [
      { _id: 'c5', amount: 5000, date: '2026-03-10', note: 'Monthly contribution' },
      { _id: 'c6', amount: 10000, date: '2026-02-10', note: 'Tax refund allocation' },
      { _id: 'c7', amount: 10000, date: '2026-01-10' },
      { _id: 'c8', amount: 10000, date: '2025-12-10', note: 'Starting the fund' },
    ],
    isCompleted: false,
    createdAt: '2025-12-01',
  },
  {
    _id: '3',
    title: 'Vacation Fund',
    description: 'Goa trip with friends',
    targetAmount: 50000,
    savedAmount: 12000,
    deadline: '2027-06-01',
    priority: 'medium',
    icon: 'plane',
    color: '#f59e0b',
    contributions: [
      { _id: 'c9', amount: 4000, date: '2026-03-05' },
      { _id: 'c10', amount: 4000, date: '2026-02-05' },
      { _id: 'c11', amount: 4000, date: '2026-01-05', note: 'First contribution' },
    ],
    isCompleted: false,
    createdAt: '2025-12-15',
  },
  {
    _id: '4',
    title: 'New Laptop',
    description: 'MacBook Air M3 for freelancing',
    targetAmount: 120000,
    savedAmount: 30000,
    deadline: '2026-11-01',
    priority: 'medium',
    icon: 'laptop',
    color: '#8b5cf6',
    contributions: [
      { _id: 'c12', amount: 10000, date: '2026-03-01' },
      { _id: 'c13', amount: 10000, date: '2026-02-01' },
      { _id: 'c14', amount: 10000, date: '2026-01-01', note: 'Starting laptop fund' },
    ],
    isCompleted: false,
    createdAt: '2025-12-20',
  },
  {
    _id: '5',
    title: 'Headphones',
    description: 'Sony WH-1000XM5',
    targetAmount: 5000,
    savedAmount: 5000,
    priority: 'low',
    icon: 'headphones',
    color: '#64748b',
    contributions: [
      { _id: 'c15', amount: 2500, date: '2026-02-15', note: 'Final contribution' },
      { _id: 'c16', amount: 2500, date: '2026-01-15', note: 'Started saving' },
    ],
    isCompleted: true,
    completedAt: '2026-02-15',
    createdAt: '2026-01-15',
  },
];
