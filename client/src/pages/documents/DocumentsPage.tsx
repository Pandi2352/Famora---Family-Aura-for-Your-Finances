import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, FileText, Image, File, Download, Trash2, Eye,
  FolderOpen, Search, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi, DOC_CATEGORIES, formatFileSize, getDocUrl } from '../../lib/api/document.api';
import type { DocumentItem, DocCategory } from '../../lib/api/document.api';
import { useFamilyStore } from '../../stores/family.store';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';

function getFileIcon(fileType: string): LucideIcon {
  if (fileType === 'application/pdf') return FileText;
  if (fileType.startsWith('image/')) return Image;
  return File;
}

type FilterType = 'all' | DocCategory;

export default function DocumentsPage() {
  const { activeFamily } = useFamilyStore();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('other');
  const [uploadDesc, setUploadDesc] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    try {
      const res = await documentApi.list(activeFamily.id, filter === 'all' ? undefined : filter);
      setDocs(res.data.data);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  }, [activeFamily, filter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFamily) return;
    setUploading(true);
    try {
      await documentApi.upload(activeFamily.id, file, uploadCategory, uploadDesc);
      toast.success('Document uploaded');
      setShowUpload(false);
      setUploadCategory('other');
      setUploadDesc('');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !activeFamily) return;
    setDeleting(true);
    try {
      await documentApi.delete(deleteTarget.id, activeFamily.id);
      toast.success('Document deleted');
      setDeleteTarget(null);
      fetchDocs();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = search.trim()
    ? docs.filter((d) => d.fileName.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()))
    : docs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Documents</h1>
          <p className="text-sm text-subtle mt-1">Store and organize your financial documents</p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-card border border-border text-subtle hover:text-heading hover:bg-surface'}`}>
            All
          </button>
          {DOC_CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat.value ? 'bg-primary-600 text-white' : 'bg-card border border-border text-subtle hover:text-heading hover:bg-surface'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => {
            const FileIcon = getFileIcon(doc.fileType);
            const catLabel = DOC_CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category;
            const uploadDate = new Date(doc.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={doc.id} className="bg-card border border-border rounded-xl p-4 group hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-center h-20 bg-surface rounded-lg mb-3">
                  {doc.fileType.startsWith('image/') ? (
                    <img src={getDocUrl(doc.fileUrl)} alt={doc.fileName} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <FileIcon className="w-10 h-10 text-muted" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-heading line-clamp-1 mb-1" title={doc.fileName}>{doc.fileName}</h3>
                {doc.description && <p className="text-xs text-muted line-clamp-1 mb-2">{doc.description}</p>}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-primary-600 bg-primary-500/10 px-1.5 py-0.5 rounded">{catLabel}</span>
                  <span className="text-xs text-muted">{formatFileSize(doc.fileSize)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted">{uploadDate}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={getDocUrl(doc.fileUrl)} target="_blank" rel="noopener"
                      className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></a>
                    <a href={getDocUrl(doc.fileUrl)} download
                      className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors" title="Download"><Download className="w-3.5 h-3.5" /></a>
                    <button onClick={() => setDeleteTarget(doc)}
                      className="p-1 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderOpen className="w-10 h-10 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-heading mb-1">No documents</h3>
          <p className="text-sm text-subtle">{search.trim() || filter !== 'all' ? 'Try adjusting filters' : 'Upload your first document'}</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowUpload(false)} />
          <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-heading mb-5">Upload Document</h2>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-500/5 transition-colors cursor-pointer mb-4">
              {uploading ? <Loader2 className="w-10 h-10 text-primary-600 mx-auto mb-3 animate-spin" /> : <Upload className="w-10 h-10 text-muted mx-auto mb-3" />}
              <p className="text-sm font-medium text-heading mb-1">Drop file or click to browse</p>
              <p className="text-xs text-muted">PDF, JPG, PNG, WEBP — Max 5MB</p>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleUpload} className="hidden" />
            </div>
            <Dropdown label="Category" options={DOC_CATEGORIES} value={uploadCategory} onChange={setUploadCategory} />
            <div className="mt-3">
              <label className="block text-xs font-medium text-subtle mb-1.5">Description (optional)</label>
              <input type="text" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="e.g., March electricity bill"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            </div>
            <button onClick={() => setShowUpload(false)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} danger title="Delete document?"
        message={`Delete "${deleteTarget?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete" loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
