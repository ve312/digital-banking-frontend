import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

function getInitialCollapsed() {
  try {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored === 'true';
  } catch {
    return false;
  }
}

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCollapsed);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', next); } catch { /* ignore localStorage read errors */ }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

