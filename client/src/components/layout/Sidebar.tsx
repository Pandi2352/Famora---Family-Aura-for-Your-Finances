import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  RefreshCw,
  FolderOpen,
  FileUp,
  Settings,
  LogOut,
  Users,
  ChevronLeft,
  Plus,
  HelpCircle,
  Crown,
  HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";
import { useAuthStore } from "../../stores/auth.store";
import { useFamilyStore } from "../../stores/family.store";
import { expenseApi } from "../../lib/api/expense.api";

interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
}

interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    group: "Overview",
    items: [
      { name: "Family Hub", path: "/dashboard", icon: LayoutDashboard },
      { name: "Insights", path: "/analytics", icon: BarChart3, badge: "NEW" },
    ],
  },
  {
    group: "Money",
    items: [
      { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
      { name: "Budgets", path: "/budgets", icon: Wallet },
      { name: "Family Goals", path: "/goals", icon: Target },
      {
        name: "Subscriptions",
        path: "/subscriptions",
        icon: RefreshCw,
        count: 3,
      },
    ],
  },
  {
    group: "Manage",
    items: [
      { name: "Members", path: "/members", icon: Users },
      { name: "Import", path: "/import", icon: FileUp, badge: "NEW" },
      { name: "Documents", path: "/documents", icon: FolderOpen },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { user } = useAuthStore();
  const { activeFamily } = useFamilyStore();

  const familyName = activeFamily?.name || "My Family";
  const memberCount = activeFamily?.memberCount || 0;
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";
  const navigate = useNavigate();
  const [todaySpent, setTodaySpent] = useState<number>(0);

  const fetchToday = () => {
    if (!activeFamily) return;
    expenseApi
      .today(activeFamily.id)
      .then((res) => setTodaySpent(res.data.data.total))
      .catch(() => {});
  };

  useEffect(() => {
    fetchToday();
  }, [activeFamily]);

  useEffect(() => {
    const handler = () => fetchToday();
    window.addEventListener("balance-refresh", handler);
    return () => window.removeEventListener("balance-refresh", handler);
  }, [activeFamily]);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-[#0a0f1c] flex flex-col z-30 border-r border-white/5 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{ transition: 'width 150ms ease-out' }}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center h-16 border-b border-white/5 shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}
      >
        {collapsed ? (
          <button
            onClick={toggle}
            className="w-8 h-8 shrink-0 bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center rounded-lg hover:from-primary-500 hover:to-violet-500 transition-all"
            title="Expand sidebar"
          >
            <HeartHandshake className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center rounded-lg shadow-lg shadow-primary-600/20">
                <HeartHandshake
                  className="w-4 h-4 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-wide whitespace-nowrap leading-tight">
                  Famora
                </span>
                <span className="text-[9px] text-sidebar-text/50 font-medium uppercase tracking-[0.15em] leading-tight">
                  Family Aura
                </span>
              </div>
            </div>
            <button
              onClick={toggle}
              className="text-sidebar-text hover:text-white transition-colors p-1 shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Quick Action */}
      <div className="px-3 pt-4 pb-3 shrink-0">
        {collapsed ? (
          <button
            onClick={() => navigate('/transactions?add=true')}
            className="w-full flex items-center justify-center border border-primary-600/40 hover:border-primary-500 hover:bg-primary-500/10 text-primary-400 hover:text-primary-300 py-2 rounded-lg transition-all group"
            title="Add Expense"
          >
            <Plus className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/transactions?add=true')}
            className="w-full flex items-center justify-center gap-2 border border-primary-600/40 hover:border-primary-500 hover:bg-primary-500/10 text-primary-400 hover:text-primary-300 py-2 rounded-lg transition-all group"
          >
            <Plus className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Add Expense
            </span>
          </button>
        )}

        {/* Today's spending */}
        {!collapsed && (
          <div className="mt-2 px-1 flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-[10px] text-sidebar-text/60 font-medium">
              Today:{" "}
              <span className="text-accent-400 font-bold">
                ₹{todaySpent.toLocaleString("en-IN")}
              </span>{" "}
              spent
            </span>
          </div>
        )}
        {collapsed && todaySpent > 0 && (
          <div
            className="mt-2 flex justify-center"
            title={`Today: ₹${todaySpent.toLocaleString("en-IN")} spent`}
          >
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto sidebar-scroll py-2 px-3 ${collapsed ? "space-y-3" : "space-y-5"}`}
      >
        {navigationGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h4 className="px-3 mb-2 text-[10px] font-semibold text-sidebar-text/40 uppercase tracking-[0.15em]">
                {group.group}
              </h4>
            )}
            {collapsed && idx > 0 && (
              <div className="border-t border-white/5 mb-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? "justify-center" : "justify-between"} ${
                      collapsed ? "px-0 py-2.5" : "px-3 py-2"
                    } text-[13px] font-medium rounded-lg transition-all duration-150 relative ${
                      isActive
                        ? "bg-primary-600/15 text-white"
                        : "text-sidebar-text hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex items-center ${collapsed ? "" : "gap-3"}`}
                      >
                        <item.icon
                          className={`w-[18px] h-[18px] shrink-0 ${isActive ? "opacity-100" : "opacity-75"}`}
                          strokeWidth={2}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span className="px-1.5 py-px bg-accent-500/20 text-accent-400 text-[9px] font-bold tracking-wider uppercase rounded shrink-0">
                          {item.badge}
                        </span>
                      )}
                      {!collapsed && item.count !== undefined && (
                        <span className="w-5 h-5 flex items-center justify-center bg-white/5 text-sidebar-text text-[10px] font-semibold rounded shrink-0">
                          {item.count}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-500 rounded-full" />
                      )}
                      {collapsed && item.count !== undefined && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-primary-600 text-white text-[8px] font-bold rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {collapsed && (
        <div className="mx-3 mb-3 shrink-0">
          <button
            className="w-full flex items-center justify-center py-2 bg-primary-900/30 border border-primary-800/40 rounded-lg hover:border-primary-600/40 transition-colors"
            title="Upgrade to Pro"
          >
            <Crown className="w-4 h-4 text-primary-400" />
          </button>
        </div>
      )}

      {/* User & Footer */}
      <div className="border-t border-white/5 px-3 py-3 shrink-0">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
        >
          <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
            <div className="w-8 h-8 shrink-0 bg-surface rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-heading">
                {userInitial}
              </span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">
                  {familyName}
                </span>
                <span className="text-[10px] text-sidebar-text">
                  {memberCount} member{memberCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className="text-sidebar-text hover:text-danger-400 transition-colors p-1.5 hover:bg-danger-400/10 rounded-lg shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-4 text-sidebar-text/40 text-[10px] tracking-wide uppercase font-semibold justify-center mt-3 pt-3 border-t border-white/5">
            <button className="hover:text-sidebar-text flex items-center gap-1.5 transition-colors">
              <HelpCircle className="w-3 h-3 shrink-0" /> Help
            </button>
            <span>v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
