import { api } from './client';

export interface SubscriptionItem {
  id: string;
  familyId: string;
  name: string;
  amount: number;
  category: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  dueDate: number;
  nextDueDate: string;
  daysUntilDue: number;
  isActive: boolean;
  autoDebit: boolean;
  notes: string;
  createdAt: string;
}

export interface SubscriptionSummary {
  activeCount: number;
  monthlyTotal: number;
  dueThisWeek: number;
  upcoming: SubscriptionItem[];
}

export interface CreateSubscriptionPayload {
  name: string;
  amount: number;
  category?: string;
  billingCycle?: string;
  dueDate: number;
  autoDebit?: boolean;
  notes?: string;
  familyId: string;
}

export const subscriptionApi = {
  list: (familyId: string) =>
    api.get<{ success: boolean; data: SubscriptionItem[] }>('/subscriptions', { params: { familyId } }),

  summary: (familyId: string) =>
    api.get<{ success: boolean; data: SubscriptionSummary }>('/subscriptions/summary', { params: { familyId } }),

  create: (data: CreateSubscriptionPayload) =>
    api.post<{ success: boolean; data: SubscriptionItem }>('/subscriptions', data),

  update: (id: string, familyId: string, data: Partial<CreateSubscriptionPayload>) =>
    api.patch<{ success: boolean; data: SubscriptionItem }>(`/subscriptions/${id}?familyId=${familyId}`, data),

  delete: (id: string, familyId: string) =>
    api.delete(`/subscriptions/${id}?familyId=${familyId}`),
};
