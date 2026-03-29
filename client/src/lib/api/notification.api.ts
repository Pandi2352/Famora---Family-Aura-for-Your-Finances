import { api } from './client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  meta: Record<string, any>;
  createdAt: string;
}

export const notificationApi = {
  list: (limit = 20) =>
    api.get<{ success: boolean; data: NotificationItem[] }>('/notifications', { params: { limit } }),

  unreadCount: () =>
    api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};
