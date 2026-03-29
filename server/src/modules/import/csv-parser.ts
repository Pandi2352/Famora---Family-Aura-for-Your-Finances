import { categorizeTransaction } from './category-mapper';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  original: string; // raw CSV line for reference
}

/**
 * Parse CSV bank statement.
 * Supports multiple common Indian bank CSV formats:
 *
 * Format 1 (SBI/HDFC/ICICI style):
 *   Date, Description, Debit, Credit, Balance
 *
 * Format 2 (Generic):
 *   Date, Description, Amount (negative = debit)
 *
 * Format 3 (Axis/Kotak style):
 *   Date, Particulars, Chq No, Debit, Credit, Balance
 */
export function parseBankCsv(csvContent: string): ParsedTransaction[] {
  const lines = csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Detect format from header
  const header = lines[0].toLowerCase();
  const dataLines = lines.slice(1);

  if (header.includes('debit') && header.includes('credit')) {
    return parseDebitCreditFormat(header, dataLines);
  }

  // Try generic format
  return parseGenericFormat(header, dataLines);
}

function parseDebitCreditFormat(header: string, lines: string[]): ParsedTransaction[] {
  const cols = header.split(',').map((c) => c.trim().toLowerCase());
  const dateIdx = cols.findIndex((c) => c.includes('date') || c.includes('txn'));
  const descIdx = cols.findIndex((c) =>
    c.includes('description') || c.includes('particular') || c.includes('narration') || c.includes('remark'),
  );
  const debitIdx = cols.findIndex((c) => c.includes('debit') || c.includes('withdrawal'));
  const creditIdx = cols.findIndex((c) => c.includes('credit') || c.includes('deposit'));

  if (dateIdx === -1 || descIdx === -1) return [];

  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const values = splitCsvLine(line);
    if (values.length < Math.max(dateIdx, descIdx, debitIdx, creditIdx) + 1) continue;

    const rawDate = values[dateIdx]?.trim();
    const description = values[descIdx]?.trim();
    const debit = parseAmount(values[debitIdx]);
    const credit = parseAmount(values[creditIdx]);

    if (!rawDate || !description) continue;

    const date = parseDate(rawDate);
    if (!date) continue;

    if (debit > 0) {
      const { category } = categorizeTransaction(description);
      results.push({
        date,
        description,
        amount: debit,
        type: 'expense',
        category,
        original: line,
      });
    }

    if (credit > 0) {
      const { category } = categorizeTransaction(description);
      results.push({
        date,
        description,
        amount: credit,
        type: 'income',
        category: category === 'Other' ? 'Other' : category,
        original: line,
      });
    }
  }

  return results;
}

function parseGenericFormat(header: string, lines: string[]): ParsedTransaction[] {
  const cols = header.split(',').map((c) => c.trim().toLowerCase());
  const dateIdx = cols.findIndex((c) => c.includes('date'));
  const descIdx = cols.findIndex((c) =>
    c.includes('description') || c.includes('particular') || c.includes('narration') || c.includes('detail'),
  );
  const amountIdx = cols.findIndex((c) => c.includes('amount'));

  if (dateIdx === -1 || amountIdx === -1) {
    // Last resort: assume Date, Description, Amount columns
    return parseAssumptionFormat(lines);
  }

  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const values = splitCsvLine(line);
    if (values.length < 3) continue;

    const rawDate = values[dateIdx]?.trim();
    const description = values[descIdx >= 0 ? descIdx : 1]?.trim();
    const amount = parseAmount(values[amountIdx]);

    if (!rawDate || amount === 0) continue;

    const date = parseDate(rawDate);
    if (!date) continue;

    const isNegative = amount < 0;
    const { category, isIncome } = categorizeTransaction(description || '');

    results.push({
      date,
      description: description || 'Unknown',
      amount: Math.abs(amount),
      type: isNegative || !isIncome ? 'expense' : 'income',
      category,
      original: line,
    });
  }

  return results;
}

function parseAssumptionFormat(lines: string[]): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const values = splitCsvLine(line);
    if (values.length < 3) continue;

    const rawDate = values[0]?.trim();
    const description = values[1]?.trim();
    const amount = parseAmount(values[2]);

    if (!rawDate || amount === 0) continue;

    const date = parseDate(rawDate);
    if (!date) continue;

    const { category, isIncome } = categorizeTransaction(description || '');

    results.push({
      date,
      description: description || 'Unknown',
      amount: Math.abs(amount),
      type: amount < 0 || !isIncome ? 'expense' : 'income',
      category,
      original: line,
    });
  }

  return results;
}

// ── Helpers ──

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseAmount(str: string | undefined): number {
  if (!str) return 0;
  // Remove currency symbols, commas, spaces
  const cleaned = str.replace(/[₹$,\s]/g, '').trim();
  if (!cleaned || cleaned === '-' || cleaned === '') return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(str: string): string | null {
  // Try common Indian date formats
  // DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY
  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,  // DD/MM/YYYY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,    // DD/MM/YY
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,    // YYYY-MM-DD
  ];

  for (const fmt of formats) {
    const match = str.match(fmt);
    if (!match) continue;

    let day: number, month: number, year: number;

    if (match[1].length === 4) {
      // YYYY-MM-DD
      year = parseInt(match[1]);
      month = parseInt(match[2]);
      day = parseInt(match[3]);
    } else {
      day = parseInt(match[1]);
      month = parseInt(match[2]);
      year = parseInt(match[3]);
      if (year < 100) year += 2000;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) continue;

    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) continue;

    return d.toISOString().slice(0, 10);
  }

  // Try native Date parse as fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}
