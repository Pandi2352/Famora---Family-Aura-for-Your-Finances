import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, useSidebar } from '../../hooks/useSidebar';
import { useAuthStore } from '../../stores/auth.store';
import { useFamilyStore } from '../../stores/family.store';

function LayoutContent() {
  const { collapsed } = useSidebar();
  const { isAuthenticated, isLoading, user, fetchMe } = useAuthStore();
  const fetchFamilies = useFamilyStore((s) => s.fetchFamilies);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      fetchFamilies();
    }
  }, [isAuthenticated, fetchMe, fetchFamilies]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.isTemporaryPassword && window.location.pathname !== '/change-password') {
      navigate('/change-password', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div
        className={`flex flex-col min-h-screen ${
          collapsed ? 'pl-[72px]' : 'pl-64'
        }`}
        style={{ transition: 'padding-left 150ms ease-out' }}
      >
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
