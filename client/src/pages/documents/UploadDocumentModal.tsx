import { X, Upload, FileUp } from 'lucide-react';

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadDocumentModal({ open, onClose }: UploadDocumentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-heading">Upload Document</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface text-muted hover:text-heading transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          {/* Drop Zone */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-500/5 transition-colors cursor-pointer">
            <FileUp className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-heading mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted">
              PDF, JPG, PNG, WEBP — Max 5 MB
            </p>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" />
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Category</label>
            <select className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
              <option value="">Select category...</option>
              <option value="receipt">Receipt</option>
              <option value="bill">Bill</option>
              <option value="tax">Tax</option>
              <option value="loan">Loan</option>
              <option value="insurance">Insurance</option>
              <option value="id_proof">ID Proof</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-subtle mb-1.5">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g., March electricity bill"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-subtle bg-surface border border-border rounded-lg hover:text-heading transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
