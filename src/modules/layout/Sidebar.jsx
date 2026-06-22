import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, PiggyBank, ArrowLeftRight, Shield, LogOut, ChevronLeft, PanelRightOpen,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import logoWhite from '/src/assets/bank-logo-white.PNG';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/cuentas', icon: PiggyBank, label: 'Cuentas' },
  { to: '/transacciones', icon: ArrowLeftRight, label: 'Transacciones' },
  { to: '/usuarios', icon: Shield, label: 'Usuarios', adminOnly: true },
];

const roleChipStyles = {
  ADMIN: 'bg-gold-500/20 text-gold-400',
  ASESOR: 'bg-banking-500/20 text-banking-400',
  AUDITOR: 'bg-slate-500/20 text-slate-400',
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const rol = user?.rol || 'USUARIO';
  const chipClass = roleChipStyles[rol] || 'bg-slate-500/20 text-slate-400';

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#0F1B35] flex flex-col transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Logo + Toggle */}
      <div className={`flex items-center h-20 px-6 border-b border-white/10 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <img src={logoWhite} alt="ProjectBank" className="h-8 w-auto" />
          {!collapsed && (
            <div>
              <span className="text-white font-bold text-lg tracking-tight">ProjectBank</span>
              <span className="block text-[10px] text-white/40 font-medium uppercase tracking-widest">Banca Global</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
            title="Contraer menú"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-banking-500/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-banking-500 rounded-r-full" />}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-banking-400' : 'text-white/40 group-hover:text-white/60'}`} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-3 mb-4">
          <button
            onClick={onToggle}
            className="w-full py-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            title="Expandir menú"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* User Area */}
      <div className={`border-t border-white/10 px-4 py-4 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-banking-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username || 'Usuario'}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${chipClass}`}>
                {rol}
              </span>
            </div>
          )}
          <button onClick={logout} className={`text-white/30 hover:text-white/70 transition-colors ${collapsed ? 'mt-2' : ''}`} title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
