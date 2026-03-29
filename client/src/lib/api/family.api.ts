import { api } from './client';

export interface InviteMemberPayload {
  name: string;
  email: string;
  relationship: string;
  familyId: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  relationship: string;
  joinedAt: string;
}

export interface FamilyDetails {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  createdAt: string;
}

export interface FamilySummary {
  id: string;
  name: string;
  slogan: string | null;
  ownerId: string;
  relationship: string;
  memberCount: number;
  createdAt: string;
}

export interface UpdateFamilyPayload {
  name?: string;
  slogan?: string;
}

export const familyApi = {
  myFamilies: () =>
    api.get<{ success: boolean; data: FamilySummary[] }>('/family'),

  details: (familyId: string) =>
    api.get<{ success: boolean; data: FamilyDetails }>(`/family/${familyId}`),

  update: (familyId: string, data: UpdateFamilyPayload) =>
    api.patch<{ success: boolean; data: { id: string; name: string; slogan: string | null } }>(`/family/${familyId}`, data),

  invite: (data: InviteMemberPayload) =>
    api.post<{ success: boolean; message: string; data: any }>('/family/invite', data),

  removeMember: (familyId: string, memberId: string) =>
    api.delete(`/family/${familyId}/members/${memberId}`),
};
