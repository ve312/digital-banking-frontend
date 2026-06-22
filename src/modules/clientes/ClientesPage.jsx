import { useState, useEffect, useRef } from 'react';
import { Search, Eye, Edit2, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClientes, deleteCliente } from '../../api/clienteService';
import ClienteDrawer from './ClienteDrawer';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/useAuth';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
};

export default function ClientesPage() {
  const { isAuditor } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const mountedRef = useRef(true);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data } = await getClientes();
      if (mountedRef.current) setClientes(Array.isArray(data) ? data : []);
    } catch {
      if (mountedRef.current) { toast.error('Error al cargar clientes'); setClientes([]); }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClientes();
    return () => { mountedRef.current = false; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCliente(id);
      toast.success('Cliente eliminado correctamente');
      setDeleteConfirm(null);
      loadClientes();
    } catch {
      toast.error('Error al eliminar el cliente');
    }
  };

  const openEdit = (cliente) => {
    setSelectedCliente(cliente);
    setDrawerOpen(true);
  };

  const openCreate = () => {
    setSelectedCliente(null);
    setDrawerOpen(true);
  };

  const filtered = clientes.filter(
    (c) => {
      const fullName = `${c.nombres || ''} ${c.apellidos || ''}`.toLowerCase();
      return fullName.includes(search.toLowerCase()) ||
        c.numeroIdentificacion?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase());
    }
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Gestión de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        {!isAuditor && (
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-banking-500 text-white font-medium hover:bg-banking-600 transition-colors">
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, documento o email..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-sm transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay clientes'}
          message={search ? 'Intente con otros términos de búsqueda' : 'Cree su primer cliente para comenzar'}
          icon={search ? Search : UserPlus}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombres</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Apellidos</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo Ident.</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Número Ident.</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Nac.</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cliente, i) => (
                  <tr key={cliente.id || i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{cliente.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{cliente.nombres}</td>
                    <td className="px-6 py-4 text-slate-600">{cliente.apellidos}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-600">{cliente.tipoIdentificacion}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{cliente.numeroIdentificacion}</td>
                    <td className="px-6 py-4 text-slate-600">{cliente.email}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(cliente.fechaNacimiento)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAuditor ? (
                          <button onClick={() => openEdit(cliente)} className="p-2 rounded-lg text-slate-400 hover:text-banking-500 transition-colors" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => openEdit(cliente)} className="p-2 rounded-lg text-slate-400 hover:text-amber-500 transition-colors" title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(cliente)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      <ClienteDrawer
        key={selectedCliente?.id ?? 'new'}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedCliente(null); }}
        cliente={selectedCliente}
        onSuccess={() => { toast.success(selectedCliente ? 'Cliente actualizado' : 'Cliente creado'); loadClientes(); }}
      />

      {/* Delete Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Eliminar Cliente</h3>
                  <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6">
                ¿Está seguro de eliminar a <strong>{deleteConfirm.nombre}</strong>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2.5 rounded-xl bg-danger text-white font-medium hover:bg-red-600 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
