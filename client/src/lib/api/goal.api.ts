import { api } from './client';

export interface GoalContribution {
  id: string;
  amount: number;
  contributedBy: string;
  note: string;
  date: string;
}

export interface GoalItem {
  id: string;
  familyId: string;
  title: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
  percent: number;
  remaining: number;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  color: string;
  contributions: GoalContribution[];
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface GoalSummary {
  activeCount: number;
  completedCount: number;
  totalTarget: number;
  totalSaved: number;
  overallPercent: number;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  priority?: string;
  color?: string;
  familyId: string;
}

export interface ContributePayload {
  amount: number;
  note?: string;
}

export const goalApi = {
  list: (familyId: string) =>
    api.get<{ success: boolean; data: GoalItem[] }>('/goals', { params: { familyId } }),

  summary: (familyId: string) =>
    api.get<{ success: boolean; data: GoalSummary }>('/goals/summary', { params: { familyId } }),

  detail: (id: string, familyId: string) =>
    api.get<{ success: boolean; data: GoalItem }>(`/goals/${id}?familyId=${familyId}`),

  create: (data: CreateGoalPayload) =>
    api.post<{ success: boolean; data: GoalItem }>('/goals', data),

  update: (id: string, familyId: string, data: Partial<CreateGoalPayload>) =>
    api.patch<{ success: boolean; data: GoalItem }>(`/goals/${id}?familyId=${familyId}`, data),

  contribute: (id: string, familyId: string, data: ContributePayload) =>
    api.post<{ success: boolean; data: GoalItem }>(`/goals/${id}/contribute?familyId=${familyId}`, data),

  delete: (id: string, familyId: string) =>
    api.delete(`/goals/${id}?familyId=${familyId}`),
};
