export type DocumentCategory = 'receipt' | 'bill' | 'tax' | 'loan' | 'insurance' | 'id_proof' | 'other';

export interface FinDocument {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  description?: string;
  uploadedAt: string;
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
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

export const mockDocuments: FinDocument[] = [
  {
    _id: '1',
    fileName: 'Electricity Bill - March 2026.pdf',
    fileType: 'application/pdf',
    fileSize: 122880,
    category: 'bill',
    description: 'BESCOM electricity bill for March',
    uploadedAt: '2026-03-23',
  },
  {
    _id: '2',
    fileName: 'Amazon Receipt - Headphones.pdf',
    fileType: 'application/pdf',
    fileSize: 46080,
    category: 'receipt',
    description: 'Sony WH-1000XM5 purchase receipt',
    uploadedAt: '2026-03-20',
  },
  {
    _id: '3',
    fileName: 'ITR - FY 2025.pdf',
    fileType: 'application/pdf',
    fileSize: 2202009,
    category: 'tax',
    description: 'Income Tax Return for FY 2024-25',
    uploadedAt: '2026-03-15',
  },
  {
    _id: '4',
    fileName: 'Term Insurance Policy.pdf',
    fileType: 'application/pdf',
    fileSize: 1572864,
    category: 'insurance',
    description: 'HDFC Life term insurance policy document',
    uploadedAt: '2026-01-10',
  },
  {
    _id: '5',
    fileName: 'Bike Loan Agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 3355443,
    category: 'loan',
    description: 'Loan agreement for Hero Honda',
    uploadedAt: '2025-12-05',
  },
  {
    _id: '6',
    fileName: 'Rent Receipt - Feb 2026.jpg',
    fileType: 'image/jpeg',
    fileSize: 819200,
    category: 'receipt',
    description: 'Rent receipt for February',
    uploadedAt: '2026-02-28',
  },
  {
    _id: '7',
    fileName: 'PAN Card.png',
    fileType: 'image/png',
    fileSize: 512000,
    category: 'id_proof',
    description: 'PAN card scanned copy',
    uploadedAt: '2025-11-15',
  },
  {
    _id: '8',
    fileName: 'Internet Bill - March 2026.pdf',
    fileType: 'application/pdf',
    fileSize: 98304,
    category: 'bill',
    description: 'ACT Fibernet monthly bill',
    uploadedAt: '2026-03-01',
  },
];
