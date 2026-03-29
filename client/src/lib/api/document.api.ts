import { api } from './client';

export type DocCategory = 'receipt' | 'bill' | 'tax' | 'loan' | 'insurance' | 'id_proof' | 'other';

export interface DocumentItem {
  id: string;
  familyId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocCategory;
  description: string;
  createdAt: string;
}

export const DOC_CATEGORIES: { value: DocCategory; label: string }[] = [
  { value: 'receipt', label: 'Receipts' },
  { value: 'bill', label: 'Bills' },
  { value: 'tax', label: 'Tax' },
  { value: 'loan', label: 'Loan' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'other', label: 'Other' },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace('/api', '');

export function getDocUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${API_BASE}/${fileUrl}`;
}

export const documentApi = {
  list: (familyId: string, category?: string) =>
    api.get<{ success: boolean; data: DocumentItem[] }>('/documents', {
      params: { familyId, ...(category ? { category } : {}) },
    }),

  upload: (familyId: string, file: File, category: string, description: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('familyId', familyId);
    formData.append('category', category);
    formData.append('description', description);
    return api.post<{ success: boolean; data: DocumentItem }>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string, familyId: string) =>
    api.delete(`/documents/${id}?familyId=${familyId}`),
};
