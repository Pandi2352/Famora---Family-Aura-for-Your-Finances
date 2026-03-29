# Famora — Feature Roadmap (Post-MVP)

> MVP is complete: Auth, Family, Members, Expenses, Budgets, Goals, Dashboard, Analytics.
> These features are prioritized by user impact and build effort.

---

## Phase A — Quick Wins (1-2 days each)

### 1. Month-over-Month Comparison
Dashboard card showing per-category change vs last month.
- "Food: ₹8,500 (+23% vs last month)"
- "Travel: ₹1,200 (-40% vs last month)"
- Green/red arrows for each category
- **Backend:** Compare current month aggregation with previous month
- **Frontend:** Comparison card on dashboard with arrows + percentages

### 2. Family Financial Health Score
Single number 0-100 on dashboard. Calculated from:
- Savings rate (40% weight)
- Budget adherence (30% weight)
- Goal progress (20% weight)
- Consistency — days with logged expenses (10% weight)

Display: Large circular gauge on dashboard with label (Poor / Fair / Good / Excellent).
Gamifies the whole app.

### 3. Export CSV
Download transactions, budgets, or goals as CSV file.
- Button on each page: "Export CSV"
- **Backend:** `GET /api/expenses/export?familyId&format=csv` returns CSV stream
- **Frontend:** Trigger download via blob URL

### 4. Expense Photo Receipts
Attach a receipt image to any expense. Already have Multer.
- Add `receiptUrl` field to Expense schema
- Upload endpoint: `POST /api/expenses/:id/receipt`
- Show thumbnail in transaction row, click to view full

### 5. Quick Stats Widget
On dashboard, show 3 quick stats:
- Today's total spending
- This week's total
- Days until next budget reset
Small compact row above the charts.

---

## Phase B — Core Enhancements (3-5 days each)

### 6. Subscriptions Module (BE + FE)
Track recurring bills. UI already exists with mock data.
- **Schema:** name, amount, category, billingCycle, dueDate, nextDueDate, isActive
- **Logic:** Auto-detect recurring expenses (same amount + category 3 months in a row)
- **Dashboard widget:** "Upcoming: Netflix ₹649 due in 2 days"
- **Monthly total:** "Subscriptions: ₹4,648/month"

### 7. Documents Module (BE + FE)
Store financial documents. UI already exists with mock data.
- **Schema:** fileName, fileUrl, fileType, fileSize, category, description
- **Multer upload** to `uploads/documents/`
- **Categories:** receipt, bill, tax, loan, insurance, id_proof, other
- **Gallery view** with category filters + search

### 8. Notifications System
In-app notifications when:
- Someone adds an expense > ₹5,000
- Budget reaches 80% / 100%
- Goal contribution received
- New member joins
- Bill due in 3 days

**Implementation:**
- Notification schema: userId, type, title, message, isRead
- Bell icon in navbar shows unread count
- Dropdown panel with notification list
- Mark as read / mark all read

### 9. Expense Comments / Thread
Family members can comment on any expense.
- "Why did we spend ₹5000 on shopping?" → "Diwali gifts"
- **Schema:** Add `comments: [{ userId, text, createdAt }]` to Expense
- **UI:** Click expense row → slide-out panel with comments
- Brings family transparency

### 10. Split Expense Between Members
"Dinner ₹2000 — split between Pandi and Wife"
- Add `splits: [{ userId, amount }]` to Expense
- UI: Toggle "Split this expense" → select members → auto-calculate equal split or custom amounts
- Dashboard: "You owe ₹500 to Wife" / "Brother owes you ₹300"
- Unique to family apps — individual trackers don't need this

---

## Phase C — Growth Features (1-2 weeks each)

### 11. Smart Categorization
Auto-suggest category based on note text.
- Keyword map: "swiggy" → Food, "uber" → Travel, "amazon" → Shopping
- Show suggestion when user types note in Add Expense
- Learn from past categorizations per family

### 12. Recurring Expense Detection
If same amount + category repeats 3 months → show alert:
- "₹999 Internet looks like a monthly expense. Track as subscription?"
- One click to create subscription entry
- **Backend:** Cron job or on-demand analysis comparing last 3 months

### 13. Monthly Family Report Card
Auto-generated at month end. Shareable card format.
```
March 2026 — Pandi's Family
Total Spent: ₹42,300
Top Category: Food (₹12,000)
Biggest Expense: Rent ₹15,000
Who Spent Most: Pandi (₹28,000)
Budget Adherence: 85%
Savings: ₹18,000
Health Score: 72/100 — Good
```
- Generate as image or PDF
- Share via WhatsApp / download

### 14. Family Allowance System
Parent sets weekly/monthly allowance per member.
- Kid's spending auto-deducts from their allowance
- "Ravi has ₹800 left of ₹2,000 this month"
- Teaches kids money management
- **Schema:** `allowances: { userId, amount, period, spent }`
- Dashboard widget per member showing allowance remaining

### 15. Daily Spending Limit
Set a daily budget (e.g., ₹1,500/day).
- Progress ring on sidebar Add Expense button
- Green → Yellow → Red as spending approaches limit
- "You've spent ₹1,200 of ₹1,500 today"
- Behavioral nudge — subtle but powerful

---

## Phase D — Platform & Scale

### 16. Multi-Family Support
One user in multiple families (already supported in schema).
- Family switcher dropdown in navbar
- "Pandi's Family" ↔ "Joint Account with Wife"
- Each family has its own expenses, budgets, goals

### 17. Pico/Aura AI Insights
AI-powered analysis using Claude/OpenAI API.
- "Your food spending is 35% higher than similar families"
- "At current savings rate, you'll reach Vacation goal by August"
- "You could save ₹3,000/month by reducing dining out"
- Monthly AI-generated summary email

### 18. Mobile App (React Native)
Same API, native mobile experience.
- Quick expense entry — open app → amount → category → done
- Push notifications for bills, budgets, goals
- Offline support with sync

### 19. Bank Statement Import
Upload bank PDF/CSV → auto-parse transactions.
- Parse common Indian bank formats (SBI, HDFC, ICICI)
- Show parsed transactions for review before importing
- Auto-categorize using smart categorization

### 20. Multi-Currency Support
For families with members abroad.
- Store currency per expense
- Auto-convert to base currency using exchange rates
- Dashboard shows totals in base currency

---

## Phase E — Monetization

### Free Plan
- 1 family
- 5 members
- 50 expenses/month
- 3 budgets
- 2 goals
- Basic charts

### Pro Plan (₹199/month)
- Unlimited families & members
- Unlimited expenses
- Unlimited budgets & goals
- AI insights (Aura)
- Export CSV/PDF
- Receipt storage (500MB)
- Priority support

### Family Plan (₹399/month)
- Everything in Pro
- Allowance system
- Split expenses
- Monthly report cards
- Bank statement import
- 2GB document storage

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Month comparison | High | Low | Do first |
| Health score | High | Low | Do first |
| Export CSV | Medium | Low | Do first |
| Subscriptions | High | Medium | Do next |
| Documents | Medium | Medium | Do next |
| Notifications | High | Medium | Do next |
| Receipt photos | Medium | Low | Quick win |
| Expense comments | Medium | Medium | Nice to have |
| Split expense | High | High | Plan carefully |
| Smart categorize | Medium | Medium | Nice to have |
| Recurring detect | Medium | Medium | Nice to have |
| Report card | High | High | Plan carefully |
| Allowance system | High | High | Unique differentiator |
| AI insights | High | High | Premium feature |
| Mobile app | Very High | Very High | After web stable |

---

## What Makes Famora Different

Every feature should reinforce the core value: **"Finance for Families, not individuals."**

Before building any feature, ask:
1. Does this need family context? (If not, every app already has it)
2. Does this increase family transparency?
3. Does this make family money conversations easier?

The winners: Split expenses, Allowances, Family report card, Member comparison, Expense approval, Activity feed. These are things **no individual tracker can do**.
