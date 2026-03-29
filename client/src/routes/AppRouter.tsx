import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import TransactionsPage from '../pages/transactions/TransactionsPage';
import BudgetsPage from '../pages/budgets/BudgetsPage';
import GoalsPage from '../pages/goals/GoalsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import SubscriptionsPage from '../pages/subscriptions/SubscriptionsPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import MembersPage from '../pages/members/MembersPage';
import ChangePasswordPage from '../pages/change-password/ChangePasswordPage';
import ImportPage from '../pages/import/ImportPage';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'budgets', element: <BudgetsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
      { path: 'import', element: <ImportPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
