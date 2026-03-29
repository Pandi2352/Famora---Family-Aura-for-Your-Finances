import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  allowCustom?: boolean;
}

export default function Dropdown({ options, value, onChange, placeholder = 'Select...', label, allowCustom = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  // If value is custom (not in options), show it as display text
  const displayText = selected?.label || (value && allowCustom ? value : '');

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const showCustomOption = allowCustom && query.trim() && !options.some(
    (o) => o.label.toLowerCase() === query.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && allowCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, allowCustom]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-xs font-medium text-subtle mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-surface border rounded-lg transition-colors ${
          open
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-border hover:border-slate-300'
        } ${displayText ? 'text-heading' : 'text-muted'}`}
      >
        <span className="truncate">{displayText || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Search / custom input */}
          {allowCustom && (
            <div className="px-2 pt-2 pb-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or type custom..."
                className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.preventDefault();
                    handleSelect(query.trim());
                  }
                }}
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto py-1">
            {/* Custom option at top */}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-600 font-medium hover:bg-primary-500/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add "{query.trim()}"
              </button>
            )}

            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  opt.value === value
                    ? 'text-primary-600 bg-primary-500/5 font-medium'
                    : 'text-heading hover:bg-surface'
                }`}
              >
                {opt.label}
                {opt.value === value && <Check className="w-3.5 h-3.5 text-primary-600" />}
              </button>
            ))}

            {filtered.length === 0 && !showCustomOption && (
              <p className="px-3 py-3 text-xs text-muted text-center">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
