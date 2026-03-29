import { api } from './client';

export interface ActivityItem {
  id: string;
  type: string;
  userName: string;
  userRelationship: string;
  meta: Record<string, any>;
  createdAt: string;
}

export const activityApi = {
  feed: (familyId: string, limit = 20, page = 1) =>
    api.get<{ success: boolean; data: ActivityItem[] }>('/activity', {
      params: { familyId, limit, page },
    }),
};
