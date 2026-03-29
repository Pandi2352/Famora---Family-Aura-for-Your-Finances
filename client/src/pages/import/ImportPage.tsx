import { useState, useRef } from 'react';
import {
  Upload, FileUp, FileCheck, Loader2, Check, X, ArrowUpRight,
  ArrowDownLeft, Trash2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { importApi } from '../../lib/api/import.api';
import type { ParsedTransaction, ParseResult } from '../../lib/api/import.api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/api/expense.api';
import { useFamilyStore } from '../../stores/family.store';
import Dropdown from '../../components/ui/Dropdown';

type Step = 'upload' | 'review' | 'done';

export default function ImportPage() {
  const { activeFamily } = useFamilyStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [transactions, setTransactions] = useState<(ParsedTransaction & { selected: boolean })[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'txt') {
      toast.error('Only CSV files are supported');
      return;
    }

    setUploading(true);
    try {
      const res = await importApi.parse(file);
      const data = res.data.data;
      setParseResult(data);
      setTransactions(data.transactions.map((t) => ({ ...t, selected: true })));
      setStep('review');
      toast.success(`Parsed ${data.totalCount} transactions`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to parse file');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleConfirm = async () => {
    if (!activeFamily) return;
    const selected = transactions.filter((t) => t.selected);
    if (selected.length === 0) return toast.error('Select at least one transaction');

    setImporting(true);
    try {
      const res = await importApi.confirm(
        activeFamily.id,
        selected.map(({ selected: _, ...t }) => t),
      );
      setImportResult(res.data.data);
      setStep('done');
      toast.success(`Imported ${res.data.data.imported} transactions`);
      window.dispatchEvent(new Event('balance-refresh'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected: checked })));
  };

  const toggleOne = (idx: number) => {
    setTransactions((prev) => prev.map((t, i) => i === idx ? { ...t, selected: !t.selected } : t));
  };

  const updateCategory = (idx: number, category: string) => {
    setTransactions((prev) => prev.map((t, i) => i === idx ? { ...t, category } : t));
  };

  const updateType = (idx: number, type: 'income' | 'expense') => {
    setTransactions((prev) => prev.map((t, i) => i === idx ? { ...t, type } : t));
  };

  const removeOne = (idx: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== idx));
  };

  const selectedCount = transactions.filter((t) => t.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Import Statement</h1>
        <p className="text-sm text-subtle mt-1">Upload your bank CSV to import transactions</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3">
        {[
          { key: 'upload', label: '1. Upload CSV' },
          { key: 'review', label: '2. Review & Edit' },
          { key: 'done', label: '3. Imported' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              step === s.key
                ? 'bg-primary-600 text-white'
                : step === 'done' || (step === 'review' && s.key === 'upload')
                  ? 'bg-success-500/10 text-success-600'
                  : 'bg-surface text-muted'
            }`}>
              {(step === 'done' || (step === 'review' && s.key === 'upload')) && s.key !== step
                ? <Check className="w-3 h-3" />
                : null}
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary-400 hover:bg-primary-500/5 transition-all cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
            ) : (
              <FileUp className="w-12 h-12 text-muted mx-auto mb-4" />
            )}
            <p className="text-sm font-semibold text-heading mb-1">
              {uploading ? 'Parsing your statement...' : 'Drop your bank statement CSV here'}
            </p>
            <p className="text-xs text-muted mb-4">or click to browse</p>
            <p className="text-[10px] text-muted">
              Supports SBI, HDFC, ICICI, Axis, Kotak and other Indian bank CSV formats
            </p>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleUpload} className="hidden" />
          </div>

          <div className="mt-6 bg-surface rounded-xl p-4">
            <p className="text-xs font-semibold text-heading mb-2">Expected CSV format:</p>
            <code className="text-[10px] text-muted block leading-relaxed">
              Date, Description, Debit, Credit, Balance<br />
              28/03/2026, "Swiggy Order", 450, , 24550<br />
              27/03/2026, "Salary March", , 65000, 25000
            </code>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 'review' && (
        <>
          {/* Summary bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-heading">{parseResult?.fileName}</span>
              </div>
              <span className="text-xs text-muted">{transactions.length} transactions</span>
              <span className="text-xs text-success-600">{transactions.filter((t) => t.type === 'income').length} income</span>
              <span className="text-xs text-danger-600">{transactions.filter((t) => t.type === 'expense').length} expense</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">{selectedCount} selected</span>
              <button onClick={handleConfirm} disabled={importing || selectedCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import {selectedCount} Transactions
              </button>
            </div>
          </div>

          {/* Transaction table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selectedCount === transactions.length}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary-600" />
                    </th>
                    <th className="text-left text-xs font-medium text-subtle px-4 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-subtle px-4 py-3">Description</th>
                    <th className="text-left text-xs font-medium text-subtle px-4 py-3 w-32">Type</th>
                    <th className="text-left text-xs font-medium text-subtle px-4 py-3 w-44">Category</th>
                    <th className="text-right text-xs font-medium text-subtle px-4 py-3">Amount</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className={`border-b border-border last:border-b-0 transition-colors ${
                      tx.selected ? 'bg-white' : 'bg-surface/30 opacity-50'
                    }`}>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={tx.selected} onChange={() => toggleOne(idx)}
                          className="w-4 h-4 rounded border-border text-primary-600" />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-heading whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-heading truncate max-w-[200px]" title={tx.description}>{tx.description}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => updateType(idx, tx.type === 'income' ? 'expense' : 'income')}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'income'
                              ? 'bg-success-500/10 text-success-600'
                              : 'bg-danger-500/10 text-danger-600'
                          }`}
                        >
                          {tx.type === 'income' ? <ArrowDownLeft className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                          {tx.type}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <Dropdown
                          options={
                            (tx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => ({ value: c, label: c }))
                          }
                          value={tx.category}
                          onChange={(v) => updateCategory(idx, v)}
                          placeholder="Category"
                          allowCustom
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => removeOne(idx)}
                          className="p-1 rounded hover:bg-danger-500/10 text-muted hover:text-danger-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => { setStep('upload'); setTransactions([]); setParseResult(null); }}
              className="px-4 py-2 text-sm font-medium text-subtle border border-border rounded-lg hover:text-heading transition-colors">
              Start Over
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && importResult && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-heading mb-2">Import Complete!</h2>
          <p className="text-sm text-subtle mb-6">
            Successfully imported <strong>{importResult.imported}</strong> of {importResult.total} transactions
          </p>
          {importResult.imported < importResult.total && (
            <div className="flex items-center justify-center gap-2 text-xs text-accent-600 mb-6">
              <AlertCircle className="w-3.5 h-3.5" />
              {importResult.total - importResult.imported} transactions were skipped (possible duplicates)
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => { setStep('upload'); setTransactions([]); setParseResult(null); setImportResult(null); }}
              className="px-4 py-2 text-sm font-medium text-subtle border border-border rounded-lg hover:text-heading transition-colors">
              Import More
            </button>
            <button onClick={() => window.location.href = '/transactions'}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              View Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
