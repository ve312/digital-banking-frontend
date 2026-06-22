import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Login from '../modules/auth/Login';
import DashboardLayout from '../modules/layout/DashboardLayout';
import DashboardHome from '../modules/dashboard/DashboardHome';
import ClientesPage from '../modules/clientes/ClientesPage';
import CuentasPage from '../modules/cuentas/CuentasPage';
import TransaccionesPage from '../modules/transacciones/TransaccionesPage';
import UsuariosPage from '../modules/usuarios/UsuariosPage';
import NotFound from '../modules/error/NotFound';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cuentas" element={<CuentasPage />} />
            <Route path="transacciones" element={<TransaccionesPage />} />
            <Route
              path="usuarios"
              element={
                <AdminRoute>
                  <UsuariosPage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#0F1B35',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
