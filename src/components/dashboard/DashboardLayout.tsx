import { useAccess } from '@/hooks/useAccess';
import { useData } from '@/contexts/DataContext';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  FileUp,
  ClipboardCheck,
  ShoppingCart,
  Mail,
  LogOut,
  Zap,
  Menu,
  X,
  Package,
  Settings,
  FileBarChart,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAccess } from '@/hooks/useAccess';
import { useData } from '@/contexts/DataContext';

const allNavItems = [
  { icon: BarChart3, label: 'Analytics', path: '/dashboard', feature: null },
  { icon: ShoppingCart, label: 'Sales', path: '/dashboard/sales', feature: 'sales' as const },
  { icon: Package, label: 'Inventory', path: '/dashboard/inventory', feature: 'inventory' as const },
  { icon: Users, label: 'Customers', path: '/dashboard/customers', feature: 'customers' as const },
  { icon: FileBarChart, label: 'Reports', path: '/dashboard/reports', feature: 'reports' as const },
  { icon: ClipboardCheck, label: 'Operations', path: '/dashboard/operations', feature: 'operations' as const },
  { icon: FileUp, label: 'File Uploads', path: '/dashboard/uploads', feature: 'uploads' as const },
  { icon: Mail, label: 'Contact Us', path: '/dashboard/contact', feature: 'contact' as const },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', feature: 'settings_basic' as const },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { business } = useData();
  const { can, tier, role } = useAccess();
  const navItems = allNavItems.filter(item =>
    item.feature === null || can(item.feature)
  );
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">Aflows</span>
            </div>
            <button
              className="lg:hidden p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>


          {/* Upgrade hint for non-pro owners */}
          {role === 'owner' && tier !== 'pro' && (
            <div className="mx-3 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-primary mb-1">
                ✨ Unlock more features
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {tier === 'starter'
                  ? 'Upgrade to Growth for Inventory, Customers & File Uploads.'
                  : 'Upgrade to Pro for Reports & Team Members.'}
              </p>
            </div>
          )}

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <NotificationCenter />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {business?.business_name || user?.businessName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.ownerName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {business?.logo_url ? (
                <img
                  src={business.logo_url}
                  alt="Business logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-primary-foreground">
                  {business?.business_name
                    ? getInitials(business.business_name)
                    : user?.businessName
                    ? getInitials(user.businessName)
                    : 'AF'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
