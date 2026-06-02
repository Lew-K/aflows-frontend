import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useAccess } from '@/hooks/useAccess';
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
  Users,
  User,
  HelpCircle,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UpgradeModal } from '@/components/dashboard/modals/UpgradeModal';

const allNavItems = [
  { icon: BarChart3, label: 'Analytics', path: '/dashboard', feature: null },
  { icon: ShoppingCart, label: 'Sales', path: '/dashboard/sales', feature: 'sales' as const },
  { icon: Package, label: 'Inventory', path: '/dashboard/inventory', feature: 'inventory' as const },
  { icon: Users, label: 'Customers', path: '/dashboard/customers', feature: 'customers' as const },
  { icon: FileBarChart, label: 'Reports', path: '/dashboard/reports', feature: 'reports' as const },
  { icon: ClipboardCheck, label: 'Operations', path: '/dashboard/operations', feature: 'operations' as const },
  { icon: FileUp, label: 'File Uploads', path: '/dashboard/uploads', feature: 'uploads' as const },
  { icon: Mail, label: 'Contact Us', path: '/dashboard/contact', feature: 'contact' as const },
  // { icon: Settings, label: 'Settings', path: '/dashboard/settings', feature: 'settings_basic' as const },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { business } = useData();
  const { can, tier, role, isExpired } = useAccess();
  const navigate = useNavigate();
  const navItems = allNavItems.filter(item =>
    item.feature === null || can(item.feature)
  );
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  // Close avatar menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const [showUpgradeHint, setShowUpgradeHint] = React.useState(() => {
    const last = localStorage.getItem('upgrade_hint_last_shown');
    if (!last) return true;
    const daysSince = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });
  
  React.useEffect(() => {
    if (showUpgradeHint) {
      localStorage.setItem('upgrade_hint_last_shown', Date.now().toString());
    }
  }, [showUpgradeHint]);

  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background flex">
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
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out flex flex-col h-full',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border flex-shrink-0">
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
          {role === 'owner' && tier !== 'pro' && showUpgradeHint && (
            <div className="mx-3 mb-2 p-3 rounded-xl bg-primary/5 border border-primary/20 flex-shrink-0 relative">
              <button
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowUpgradeHint(false)}
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs font-bold text-primary mb-1">✨ Upgrade Plan</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed pr-4">
                {tier === 'starter'
                  ? 'Growth — KES 2,499/mo: Inventory, CRM, full analytics, 3 staff.'
                  : 'Pro — KES 3,999/mo: Unlimited staff, WhatsApp, file uploads, PDF exports.'}
              </p>
            </div>
          )}

          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
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

            {/* Gear / Settings shortcut */}
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {business?.business_name || user?.businessName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.ownerName}</p>
            </div>

            {/* Avatar with dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen(prev => !prev)}
                className="flex items-center gap-1 focus:outline-none"
                aria-label="Account menu"
              >
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
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </button>

              {/* Dropdown menu */}
              {avatarMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-card border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  {/* Business info header */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {business?.business_name || user?.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {tier} plan
                    </span>
                  </div>

                  {role === 'owner' && tier !== 'pro' && (
                    <button
                      onClick={() => { setUpgradeModalOpen(true); setAvatarMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade Plan
                    </button>
                  )}

                  {/* Menu items */}
                  <button
                    onClick={() => { navigate('/dashboard/contact'); setAvatarMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    Help & Support
                  </button>

                  {/* Tour Guide */}
                  <button
                    onClick={() => {
                      localStorage.removeItem('aflows_tour_completed');
                      window.location.reload(); // simplest way to re-trigger
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Compass className="w-4 h-4 text-muted-foreground" />
                    Tour Guide
                  </button>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => { logout(); setAvatarMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content — only this scrolls */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {upgradeModalOpen && (
        <UpgradeModal
          requiredPlan={tier === 'starter' ? 'growth' : 'pro'}
          featureName="Next Plan Features"
          onClose={() => setUpgradeModalOpen(false)}
        />
      )}
      {isExpired && (
        <UpgradeModal
          requiredPlan={tier === 'starter' ? 'growth' : 'pro'}
          featureName="Trial Expired"
          onClose={() => {}}
          locked={true}
        />
      )}
      
    </div>
  );
};
