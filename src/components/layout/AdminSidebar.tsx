import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Warehouse,
  Tag,
  Image,
  BarChart3,
  Settings,
  UserCog,
  Bike,
  Star,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/delivery-partners', label: 'Delivery Partners', icon: Bike },
  { path: '/promotions', label: 'Promotions', icon: Tag },
  { path: '/banners', label: 'Banners', icon: Image },
  { path: '/gallery', label: 'Gallery', icon: Image },
  { path: '/faqs', label: 'FAQs', icon: HelpCircle },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/admin-users', label: 'Admin Users', icon: UserCog },
];

const AdminSidebar = () => {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => dispatch(toggleSidebar())}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-20' : 'w-64',
          // On mobile: always collapsed icon-only, hidden when collapsed state is true
          'max-lg:w-20 max-lg:data-[collapsed=true]:w-0 max-lg:data-[collapsed=true]:overflow-hidden'
        )}
        data-collapsed={sidebarCollapsed}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <img src={logo} alt="Brundhavanam Desi Foods" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <h1 className="font-heading text-lg font-bold text-sidebar-foreground">
              Brundhavanam
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Desi Foods Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'sidebar-link',
                    isActive && 'sidebar-link-active',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="flex items-center justify-center gap-2 border-t border-sidebar-border px-4 py-4 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <>
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
    </>
  );
};

export default AdminSidebar;