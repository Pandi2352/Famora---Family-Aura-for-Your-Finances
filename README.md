<div align="center">

# <img src="https://img.icons8.com/3d-fluency/48/handshake.png" width="36" /> Famora

### *Family Aura for Your Finances*

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**The family finance app that no individual tracker can replace.**

Track expenses, set budgets, save toward goals, and keep your entire family financially transparent — all in one place.

---

<img width="80%" src="https://img.shields.io/badge/🏠_Built_for_Real_Families-4f46e5?style=for-the-badge&labelColor=4f46e5" />

</div>

---

## Why Famora?

Most finance apps are built for **individuals**. Famora is built for **families**.

| Individual Trackers | Famora |
|---|---|
| One person's expenses | Whole family's money |
| No shared visibility | Everyone sees the picture |
| No accountability | Emoji reactions + activity feed |
| No collaboration | Invite members, split roles |
| No approval flows | Family expense transparency |

---

## Features

### Core
| Feature | Description |
|---------|-------------|
| **Family System** | Create family, invite members (brother, sister, spouse, parents) via email |
| **Expense Tracking** | Full CRUD with categories, payment methods, notes |
| **Smart Budgets** | Monthly limits per category, auto-calculated from real expenses |
| **Savings Goals** | Family goals with contributions, progress tracking, auto-complete |
| **Dashboard** | Real-time charts, health score, member comparison, activity feed |
| **Analytics** | 6-month trends, daily spending, category breakdown, top expenses |

### Unique to Famora
| Feature | Description |
|---------|-------------|
| **Family Activity Feed** | "Mom added Rs.850 Groceries" — live social feed for money |
| **Expense Reactions** | React with emoji (thumbs up, fire, shock) to any expense |
| **Pin Important Expenses** | Pin rent, salary to top of the list |
| **Health Score** | 0-100 family financial health (savings + budgets + goals + consistency) |
| **Month Comparison** | "Food +23% vs last month" per category |
| **Bank Import** | Upload CSV bank statement, auto-categorize with 50+ Indian keywords |
| **Member Spending** | Visual bar showing who spent how much |

### More
| Feature | Description |
|---------|-------------|
| **Subscriptions** | Track recurring bills with due date alerts |
| **Documents** | Upload receipts, bills, tax docs (PDF, JPG, PNG) |
| **Notifications** | In-app alerts for large expenses, budget warnings |
| **Profile & Avatar** | Upload profile photo, update name/phone |
| **CSV Export** | Download all transactions as CSV |
| **Invite via Email** | Send login credentials automatically using SMTP |
| **Spotlight Search** | Cmd+K style search across the app |

---

## Tech Stack

```
Frontend                Backend                 Database
-----------             -----------             -----------
React 19                NestJS 11               MongoDB
TypeScript              TypeScript              Mongoose ODM
Vite 8                  JWT Auth                UUID (no ObjectId)
Tailwind CSS v4         Passport.js
Recharts                Multer (file uploads)
Zustand                 Swagger (API docs)
Axios                   class-validator
React Router v7         my-utils-helpers (email)
React Hot Toast         bcrypt
Lucide Icons
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or Atlas URI)
- npm or yarn

### 1. Clone

```bash
git clone <your-repo-url>
cd Paisapilot
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env    # Edit with your MongoDB URI & SMTP credentials
```

### 3. Seed Default User

```bash
npm run seed
```

Output:
```
Created user: Pandi (pandi@famora.app)
Created family: Pandi's Family
Email:    pandi@famora.app
Password: pandi123
```

### 4. Start Backend

```bash
npm run start:dev
# Server runs on http://localhost:7000
# Swagger docs at http://localhost:7000/api/docs
```

### 5. Setup & Start Frontend

```bash
cd ../client
npm install
npm run dev
# Opens http://localhost:7001 automatically
```

### 6. Login

```
Email:    pandi@famora.app
Password: pandi123
```

---

## Project Structure

```
Paisapilot/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Dropdown, ConfirmDialog, etc.)
│   │   ├── pages/              # All page components
│   │   │   ├── auth/           # Login
│   │   │   ├── dashboard/      # Family Hub
│   │   │   ├── transactions/   # Money Flow
│   │   │   ├── budgets/        # Spending Limits
│   │   │   ├── goals/          # Goals Vault
│   │   │   ├── analytics/      # Insights
│   │   │   ├── subscriptions/  # Auto Payments
│   │   │   ├── documents/      # Document Gallery
│   │   │   ├── members/        # Family Members
│   │   │   ├── import/         # Bank Statement Import
│   │   │   ├── settings/       # Profile, Security, Notifications
│   │   │   └── errors/         # 404, 401
│   │   ├── stores/             # Zustand (auth, family)
│   │   ├── lib/api/            # Axios API clients
│   │   └── hooks/              # Custom hooks
│   └── vite.config.ts
│
├── server/                     # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Login, JWT, change password
│   │   │   ├── user/           # Profile, avatar upload
│   │   │   ├── family/         # Family CRUD, invite, members
│   │   │   ├── expense/        # Full CRUD + reactions + pin + analytics
│   │   │   ├── budget/         # Monthly budgets with auto-spending
│   │   │   ├── goal/           # Savings goals with contributions
│   │   │   ├── subscription/   # Recurring bill tracking
│   │   │   ├── document/       # File upload & management
│   │   │   ├── notification/   # In-app notification system
│   │   │   ├── activity/       # Family activity feed
│   │   │   ├── import/         # Bank CSV parser + auto-categorize
│   │   │   └── email/          # SMTP email (invite templates)
│   │   ├── config/             # DB, Swagger, Multer configs
│   │   ├── common/             # Response interceptor, error filter
│   │   └── utils/              # UUID generator + Mongoose plugin
│   ├── uploads/                # User uploads (avatars, receipts, docs)
│   └── .env
│
└── docs/
    ├── PLAN.md                 # Full build plan
    └── FEATURES.md             # Feature roadmap (post-MVP)
```

---

## API Overview

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /login` `GET /me` `POST /change-password` `POST /logout` |
| **Family** | `GET /` `GET /:id` `PATCH /:id` `POST /invite` `DELETE /:id/members/:id` |
| **User** | `PATCH /profile` `POST /avatar` `DELETE /avatar` |
| **Expenses** | `CRUD` + `/summary` `/categories` `/trends` `/daily` `/members` `/top` `/today` `/comparison` `/health` `/export` `/react` `/pin` `/receipt` |
| **Budgets** | `CRUD` + `/summary` |
| **Goals** | `CRUD` + `/contribute` `/summary` |
| **Subscriptions** | `CRUD` + `/summary` |
| **Documents** | `POST (upload)` `GET (list)` `DELETE` |
| **Notifications** | `GET` `/unread-count` `PATCH /read` `PATCH /read-all` |
| **Activity** | `GET (feed)` |
| **Import** | `POST /parse` `POST /confirm` |

Full Swagger docs available at `http://localhost:7000/api/docs`

---

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/famora

# App
PORT=7000
FRONTEND_URL=http://localhost:7001

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (for invite emails)
SMTP_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@famora.app

# Seed User
SEED_USER_NAME=Pandi
SEED_USER_EMAIL=pandi@famora.app
SEED_USER_PASSWORD=pandi123
SEED_FAMILY_NAME=Pandi's Family
```

---

## The Flow

```
1. Seed creates default user + family
2. User logs in
3. Invites family members (they get email with temp password)
4. Members login → forced to change password
5. Everyone adds expenses, sets budgets, tracks goals
6. Dashboard shows real-time family financial health
7. Activity feed keeps everyone in the loop
```

---

## What Makes This Different

> **"Does this need family context? If not, every app already has it."**

- **Activity Feed** — No individual tracker has this
- **Expense Reactions** — Social accountability for money
- **Member Comparison** — Who spent how much, transparently
- **Shared Goals** — Family saves together
- **Bank Import** — Upload CSV, auto-categorize with Indian bank keywords
- **Health Score** — One number for your family's financial fitness

---

<div align="center">

**Built with focus by Pandi**

*Famora — Because family money should be everyone's business.*

[![Made with Love](https://img.shields.io/badge/Made_with-Love-ff69b4?style=for-the-badge)](.)
[![Family First](https://img.shields.io/badge/Family-First-4f46e5?style=for-the-badge)](.)

</div>
