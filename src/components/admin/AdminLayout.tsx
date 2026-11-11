import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Image as ImageIcon,
  User,
  Cpu,
  Share2,
  Settings,
  Mail,
  Database,
  ExternalLink,
  LogOut,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onViewSite: () => void;
  unreadCount?: number;
  children: React.ReactNode;
}

export function AdminLayout({
  currentTab,
  onSelectTab,
  onLogout,
  onViewSite,
  unreadCount = 0,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'about', label: 'About & Bio', icon: User },
    { id: 'skills', label: 'Skills & Tools', icon: Cpu },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'messages', label: 'Inquiries', icon: Mail, badge: unreadCount },
    { id: 'supabase', label: 'Supabase & Deploy', icon: Database },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-zinc-200 flex-col justify-between shrink-0 fixed inset-y-0 z-30">
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-tight text-zinc-900 uppercase">
                AURA CMS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-xs">
                v1.0
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 space-y-2">
          <button
            onClick={onViewSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xs transition-colors cursor-pointer"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-display font-semibold text-sm text-zinc-900 capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-time Sync Active</span>
            </div>

            <button
              onClick={onViewSite}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <span>View Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile slide-down menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-zinc-200 p-4 space-y-1 z-30 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs ${
                    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-3 border-t border-zinc-100 flex gap-2">
              <button
                onClick={onViewSite}
                className="flex-1 py-2 text-xs text-center border border-zinc-200 rounded-xs"
              >
                View Site
              </button>
              <button
                onClick={onLogout}
                className="flex-1 py-2 text-xs text-center text-red-600 border border-red-200 rounded-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Child Content */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
