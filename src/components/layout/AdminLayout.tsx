import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminHeader />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64',
          'ml-0'
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;