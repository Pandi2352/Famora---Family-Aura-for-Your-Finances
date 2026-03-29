import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  loading = false, danger = false, onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
          danger ? 'bg-danger-500/10' : 'bg-accent-500/10'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-danger-500' : 'text-accent-600'}`} />
        </div>

        <h3 className="text-lg font-semibold text-heading mb-1">{title}</h3>
        <p className="text-sm text-subtle leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-subtle bg-surface border border-border rounded-xl hover:text-heading transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
              danger
                ? 'bg-danger-500 hover:bg-danger-600'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
