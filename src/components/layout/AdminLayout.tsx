// src/components/layout/AdminLayout.tsx
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { usePendingCount } from '../../hooks/useDeposits';
import { adminLogout } from '../../api/auth.api';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/admin/deposits',      icon: '💰', label: 'Deposits',      badge: true  },
  { to: '/admin/users',         icon: '👥', label: 'Users',         badge: false },
  { to: '/admin/notifications', icon: '📢', label: 'Notifications', badge: false },
  { to: '/admin/analytics',     icon: '📊', label: 'Analytics',     badge: false },
  { to: '/admin/prizes',        icon: '🎁', label: 'Prizes',        badge: false },
  { to: '/admin/celebrities',   icon: '⭐', label: 'Celebrities',   badge: false },
  { to: '/admin/tickets',       icon: '🎟️', label: 'Tickets',       badge: false },
  { to: '/admin/tiers',         icon: '🏅', label: 'Tiers',         badge: false },
  { to: '/admin/audit',         icon: '📋', label: 'Audit Log',     badge: false },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { adminUser, logout } = useAdminAuthStore();
  const navigate = useNavigate();
  const { data: countData } = usePendingCount();
  const pendingCount = countData?.count ?? 0;

  async function handleLogout() {
    try { await adminLogout(); } catch {}
    logout();
    navigate('/admin/login');
  }

  const sideW = collapsed ? 'w-14' : 'w-[240px]';

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden">
      {/* Sidebar */}
      <aside className={cn('flex flex-col flex-shrink-0 bg-admin-sidebar border-r border-sw-border transition-all duration-200', sideW)}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sw-border min-h-[56px]">
          <span className="text-xl flex-shrink-0">⭐</span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-heading font-bold text-white text-sm leading-none">StarWorld</p>
              <p className="text-gold text-[10px] font-semibold uppercase tracking-widest mt-0.5">Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn('ml-auto text-white/30 hover:text-white transition-colors text-sm', collapsed && 'mx-auto')}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-all group',
                isActive ? 'bg-gold/10 text-gold font-semibold' : 'text-white/50 hover:text-white hover:bg-sw-card-2'
              )}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="font-heading flex-1 truncate">{item.label}</span>
                  {item.badge && pendingCount > 0 && (
                    <span className="bg-gold text-[#0B0F1E] text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && pendingCount > 0 && (
                <span className="absolute left-8 top-1 bg-gold w-2 h-2 rounded-full" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sw-border p-3">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center text-[#0B0F1E] font-bold text-xs flex-shrink-0">
                {adminUser?.username?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{adminUser?.username}</p>
                <p className="text-white/30 text-[10px] truncate capitalize">{adminUser?.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout} className="text-white/30 hover:text-loss text-sm transition-colors" title="Logout">⏏</button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-white/30 hover:text-loss transition-colors text-sm" title="Logout">⏏</button>
          )}
        </div>
      </aside>

      {/* Main area – crucial: Outlet renders child routes */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}