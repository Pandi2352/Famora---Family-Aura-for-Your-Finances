/**
 * Auto-categorize transactions based on description keywords.
 * Maps common Indian bank narrations to expense categories.
 */

const KEYWORD_MAP: [RegExp, string][] = [
  // Food & Dining
  [/swiggy|zomato|dominos|pizza|mcdonalds|kfc|burger|restaurant|cafe|biryani|food|dining|hotel\s/i, 'Food & Dining'],
  // Travel & Transport
  [/uber|ola|rapido|irctc|railway|petrol|diesel|fuel|parking|toll|metro|bus\s|cab\s|flight|airport|makemytrip/i, 'Travel & Transport'],
  // Groceries
  [/bigbasket|blinkit|zepto|jiomart|dmart|reliance\s*fresh|grocer|supermarket|kirana|vegetables|milk\s/i, 'Groceries'],
  // Shopping
  [/amazon|flipkart|myntra|ajio|meesho|nykaa|shopee|shopping|mall|clothes|fashion/i, 'Shopping'],
  // Bills & Utilities
  [/electric|electricity|bescom|water\s*bill|gas\s*bill|broadband|internet|wifi|jio|airtel|vi\s|bsnl|dth|tata\s*sky|phone\s*bill|recharge/i, 'Bills & Utilities'],
  // Entertainment
  [/netflix|hotstar|prime\s*video|spotify|youtube|sony\s*liv|zee5|movie|cinema|pvr|inox|gaming|playstation|xbox/i, 'Entertainment'],
  // Health & Medical
  [/hospital|doctor|pharma|medical|medicine|apollo|medplus|1mg|netmeds|health|clinic|dental|eye|lab\s*test/i, 'Health & Medical'],
  // Education
  [/school|college|university|tuition|course|udemy|coursera|book|library|exam|education/i, 'Education'],
  // Rent & Housing
  [/rent|house\s*rent|flat\s*rent|maintenance|society|apartment/i, 'Rent & Housing'],
  // EMI & Loans
  [/emi|loan|hdfc\s*ltd|bajaj\s*fin|credit\s*card\s*payment|principal|interest/i, 'EMI & Loans'],
  // Investments
  [/mutual\s*fund|sip|zerodha|groww|upstox|share|stock|nps|ppf|fd\s|fixed\s*deposit|investment/i, 'Investments'],
  // Personal Care
  [/salon|haircut|spa|parlour|grooming|beauty/i, 'Personal Care'],
  // Gifts & Donations
  [/gift|donation|charity|temple|church|mosque/i, 'Gifts & Donations'],
  // Insurance
  [/insurance|lic|premium|policy/i, 'Bills & Utilities'],
  // Salary / Income
  [/salary|credit\s*interest|refund|cashback|dividend/i, '__INCOME__'],
];

export function categorizeTransaction(description: string): { category: string; isIncome: boolean } {
  const desc = description.toLowerCase();

  // Check for income indicators
  const incomeKeywords = /salary|credited|credit\s*interest|refund|cashback|dividend|neft\s*cr|imps\s*cr|upi\s*cr/i;
  if (incomeKeywords.test(desc)) {
    // Try to find specific income category
    if (/salary/i.test(desc)) return { category: 'Salary', isIncome: true };
    if (/refund|cashback/i.test(desc)) return { category: 'Refunds', isIncome: true };
    if (/interest|dividend/i.test(desc)) return { category: 'Investments', isIncome: true };
    return { category: 'Other', isIncome: true };
  }

  for (const [regex, category] of KEYWORD_MAP) {
    if (regex.test(desc)) {
      if (category === '__INCOME__') {
        return { category: 'Other', isIncome: true };
      }
      return { category, isIncome: false };
    }
  }

  return { category: 'Other', isIncome: false };
}
