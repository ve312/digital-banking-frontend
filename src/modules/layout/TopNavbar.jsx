import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/cuentas': 'Cuentas',
  '/transacciones': 'Transacciones',
  '/usuarios': 'Usuarios',
};

export default function TopNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const { user } = useAuth();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentLabel = breadcrumbMap[location.pathname] || pathSegments[pathSegments.length - 1] || 'Dashboard';

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">ProjectBank</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-medium capitalize">{currentLabel}</span>
          </nav>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-banking-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user?.username || 'Usuario'}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{user?.rol || 'Rol'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
