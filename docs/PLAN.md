# Famora — Family Finance App: Complete Build Plan

> "Finance App Built for Families" — Not just another personal tracker.
> Your advantage: **family money system** with shared visibility, approvals, and goals.

---

## Product Vision

Most finance apps are individual money trackers. Famora is different — it's built for **real families**. Every member sees the shared picture, contributes expenses, tracks budgets together, and works toward common savings goals.

**One killer feature:** Shared Expense Approval — Kid adds expense, Parent must approve.

---

## Phase 1 — V1 Core Product (MVP)

Only build what's needed for launch. Nothing else.

### V1 Features

| Module | What It Does |
|--------|-------------|
| Auth | Signup, Login, JWT, Refresh token |
| Family | Create family, join family, invite members |
| Members | Roles (admin / member / child), permissions |
| Expenses | Add, edit, delete, list with filters |
| Budgets | Monthly category limits, track remaining |
| Goals | Savings targets with progress |
| Dashboard | Overview of everything |

### V1 Does NOT Include

- Notifications (Phase 5)
- Subscription tracking (Phase 5)
- AI Insights engine (Phase 5)
- Admin panel
- Documents/file uploads
- Landing page

---

## Phase 2 — Database Design

### Users

```
users
├── _id: ObjectId
├── name: String
├── email: String (unique)
├── password: String (hashed)
├── avatar: String
└── createdAt: Date
```

### Families

```
families
├── _id: ObjectId
├── name: String
├── ownerId: ObjectId (ref: users)
└── createdAt: Date
```

### Family Members

```
family_members
├── _id: ObjectId
├── familyId: ObjectId (ref: families)
├── userId: ObjectId (ref: users)
├── role: Enum ["admin", "member", "child"]
└── joinedAt: Date
```

**Note:** One user can be in multiple families (good SaaS design).

### Expenses

```
expenses
├── _id: ObjectId
├── familyId: ObjectId (ref: families)
├── createdBy: ObjectId (ref: users)
├── amount: Number
├── category: String
├── note: String
├── date: Date
├── status: Enum ["approved", "pending", "rejected"] (for child approval flow)
├── approvedBy: ObjectId (ref: users, optional)
├── createdAt: Date
└── updatedAt: Date
```

### Budgets

```
budgets
├── _id: ObjectId
├── familyId: ObjectId (ref: families)
├── category: String
├── limit: Number
├── month: Number (1-12)
├── year: Number
├── createdAt: Date
└── updatedAt: Date
```

**Backend logic:** `remaining = limit - totalExpenses` (computed, not stored)

### Goals

```
goals
├── _id: ObjectId
├── familyId: ObjectId (ref: families)
├── title: String
├── targetAmount: Number
├── savedAmount: Number
├── deadline: Date
├── createdAt: Date
└── updatedAt: Date
```

---

## Phase 3 — Backend (NestJS)

Build modules in this exact order:

### Module 1: Auth

**Features:** Signup, Login, JWT, Refresh token

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, return JWT |
| GET | `/auth/me` | Get current user |

**Key logic:**
- Passwords hashed with bcrypt
- Access token: 15 min expiry
- Refresh token: 7 days, httpOnly cookie

### Module 2: Family

**Features:** Create family, join, invite, remove

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/family/create` | Create new family |
| POST | `/family/invite` | Invite member (email or link) |
| POST | `/family/join` | Join via invite |
| GET | `/family/details` | Get family info + members |

**Important logic:**
- Creator becomes `admin` automatically
- One user can belong to multiple families
- Invite generates a shareable link or sends email

### Module 3: Expenses

**Features:** Full CRUD + filters + approval

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Add expense |
| GET | `/expenses` | List expenses (with filters) |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| PATCH | `/expenses/:id/approve` | Approve/reject (admin only) |

**Filters:** month, category, member, status

**Approval flow:**
- If `role === "child"` → expense status = `"pending"`
- Admin/member gets notification to approve/reject
- Only approved expenses count toward budgets

### Module 4: Budgets

**Features:** Create budget, track spending, show remaining

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/budgets` | Create budget |
| GET | `/budgets` | Get budgets with spending status |

**Response includes computed fields:**
```json
{
  "category": "Food",
  "limit": 10000,
  "spent": 6500,
  "remaining": 3500,
  "percentUsed": 65,
  "status": "safe"
}
```

### Module 5: Goals

**Features:** Create goal, add savings, track progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/goals` | Create goal |
| GET | `/goals` | List goals |
| PATCH | `/goals/:id` | Update goal |
| POST | `/goals/:id/contribute` | Add savings |
| DELETE | `/goals/:id` | Delete goal |

---

## Phase 4 — Frontend (React)

Build UI in this exact order:

### Screen 1: Authentication

**Pages:** Login, Register

**Stores:**
- `authStore` — current user, tokens
- `familyStore` — active family, members

### Screen 2: Onboarding (First Time User)

After signup, guide user through:

1. **Create Family** → "Pandi's Family"
2. **Invite Members** → Wife, Kids, Parents (email or share link)
3. **Setup Basics** → 3 quick questions:
   - Monthly income
   - Monthly budget
   - Savings goal

This makes the dashboard useful immediately.

### Screen 3: Dashboard

The home screen. Show:

| Card | Data |
|------|------|
| Money Spent Today | Sum of today's expenses |
| Remaining Budget | Total budget - total spent |
| Savings Progress | Across all goals |
| Recent Expenses | Last 5 entries |
| Family Activity | "Mom added ₹850 groceries" |
| Budget Status | Per-category progress bars |

**Critical UX:** Add a floating "Quick Add Expense" button. 80% of app usage is just: add expense → close app.

### Screen 4: Add Expense Flow

This is the most important UX in the app. Make it **super fast**.

```
Click Add Expense → Modal opens →
  Enter: Amount, Category, Note, Date →
    Save → Done
```

Must feel instant. No page navigation, no loading spinners.

### Screen 5: Transactions List

Show all expenses with:
- Date grouping (Today, Yesterday, This Week)
- Filters: month, category, member
- Who added each expense (avatar + name)
- Pending approvals highlighted

### Screen 6: Budgets

Show per-category:
- Limit vs spent
- Progress bar (green/yellow/red)
- Warning when close to limit: "You're close to your food budget"

### Screen 7: Goals

- Progress bars with percentage
- Deadline countdown
- Contribute button per goal

### Screen 8: Family Members

Show:
- Members list with roles
- Invite button (copy link / email)
- Role management (admin can change roles)

### Sidebar Navigation Order

```
Dashboard
↓
Add Expense
↓
Transactions
↓
Budgets
↓
Goals
↓
Members
↓
Settings
```

This order matches real usage frequency.

---

## Phase 5 — Post-V1 Features

Add these after V1 works and has users.

### 5.1 Notifications

**Trigger when:**
- Expense added by family member
- Member joins family
- Goal updated
- Budget warning (80% / 100%)
- Expense needs approval

**Tech:** Socket.io for real-time

### 5.2 Subscription Tracking

**Logic:** If same amount repeats every month → mark as subscription.

Show:
- Subscription list with monthly total
- Suggestion: "You may want to review unused subscriptions"

### 5.3 Insights Page

**Charts:**
- Spending by category (pie)
- Monthly trend (bar)
- Budget usage (progress bars)
- Family member comparison

**Libraries:** recharts

### 5.4 Monthly Review

At end of month, auto-generate report:
- Total spent
- Budget adherence
- Savings made
- Top expense category
- "You saved 15% more than last month"

---

## Phase 6 — Production Ready

### Security

- Rate limiting on all endpoints
- Input validation (class-validator)
- Helmet (HTTP headers)
- CORS protection
- bcrypt for passwords
- JWT rotation

### Performance

- MongoDB indexes on frequently queried fields
- Pagination on all list endpoints
- Redis caching (optional, for dashboard data)

### DevOps

- Docker Compose (frontend + backend + MongoDB)
- Environment variables (.env)
- CI/CD pipeline
- SSL certificate

---

## Phase 7 — Monetization (Optional)

### Free Plan

- 1 family
- 5 members
- Basic expense tracking
- 3 budgets
- 2 goals

### Pro Plan

- Unlimited families & members
- Insights page
- Subscription tracker
- Smart suggestions from Aura AI
- Export reports (CSV/PDF)
- Priority support

---

## Phase 8 — Launch Strategy

Launch early. Don't wait for perfection.

### Where to Launch

1. **Product Hunt** — "Family Expense Tracker for Real Families"
2. **Reddit** — r/personalfinance, r/SideProject
3. **Indie Hackers** — Build in public story
4. **Twitter/X** — Dev journey thread
5. **LinkedIn** — Professional angle

### Title

> "Built a Family Expense Tracker for Real Families"

---

## Build Timeline

| Week | Focus | Deliverables |
|------|-------|-------------|
| **Week 1** | Auth + Family system | Register, login, create/join family, invite members |
| **Week 2** | Expenses + Dashboard | Add expense, transactions list, dashboard overview |
| **Week 3** | Budgets + Goals | Budget tracking, savings goals, progress bars |
| **Week 4** | Polish UI + Deploy | Responsive design, error handling, Docker, deploy |

---

## User Workflow Summary

### First Time (Onboarding)
```
Sign Up → Create Family → Invite Members → Setup Basics → Dashboard
```

### Daily Use (80% of usage)
```
Open App → Check Dashboard → Add Expense → Close
```

### Weekly Use
```
Review Transactions → Check Budgets → Update Goals
```

### Monthly Use
```
Monthly Review → Adjust Budgets → Plan Next Month
```

---

## What Makes Famora Unique

1. **Family-first** — not individual, family money management
2. **Shared visibility** — everyone sees the financial picture
3. **Approval workflow** — kids need parent approval for expenses
4. **Family activity feed** — "Mom added ₹850 groceries"
5. **Simple** — 80% usage is just adding expenses

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt + httpOnly cookies |
| Charts | Recharts |
| Icons | Lucide React |
| State | Zustand |
| Forms | React Hook Form + Zod |
| API Client | Axios + React Query |
| Real-time | Socket.io (Phase 5) |
| Deployment | Docker + Nginx |
