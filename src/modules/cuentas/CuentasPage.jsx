import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, CreditCard, AlertTriangle, CheckCircle, XCircle, Ban, Building2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClientes } from '../../api/clienteService';
import { getAllCuentas, activarCuenta, inactivarCuenta, cancelarCuenta } from '../../api/cuentaService';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import CuentaDrawer from './CuentaDrawer';
import { useAuth } from '../../context/useAuth';

const formatCOP = (num) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

export default function CuentasPage() {
  const { isAuditor } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [cuentasError, setCuentasError] = useState(null);
  const mountedRef = useRef(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setCuentasError(null);
    try {
      const [cuentasRes, clientesRes] = await Promise.all([getAllCuentas(), getClientes()]);
      if (mountedRef.current) {
        setCuentas(Array.isArray(cuentasRes.data) ? cuentasRes.data : []);
        setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
      }
    } catch (err) {
      if (mountedRef.current) {
        const msg = err.response?.data?.message || 'Error al cargar cuentas';
        setCuentasError(msg);
        toast.error(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    return () => { mountedRef.current = false; };
  }, [loadData]);

  const clienteMap = {};
  clientes.forEach((c) => { clienteMap[c.id] = c; });

  const getClienteName = (clienteId) => {
    const c = clienteMap[clienteId];
    return c ? `${c.nombres} ${c.apellidos}` : `ID: ${clienteId}`;
  };

  const handleStatusAction = async () => {
    if (!statusConfirm) return;
    const { numeroCuenta, action } = statusConfirm;
    const actions = {
      activar: { fn: activarCuenta, msg: 'Cuenta activada exitosamente', error: 'Error al activar cuenta' },
      inactivar: { fn: inactivarCuenta, msg: 'Cuenta inactivada exitosamente', error: 'Error al inactivar cuenta' },
      cancelar: { fn: cancelarCuenta, msg: 'Cuenta cancelada exitosamente', error: 'Error al cancelar cuenta' },
    };
    const a = actions[action];
    if (!a) return;
    try {
      await a.fn(numeroCuenta);
      toast.success(a.msg);
      setStatusConfirm(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || a.error);
      setStatusConfirm(null);
    }
  };

  const openStatusConfirm = (numeroCuenta, action, clienteInfo) => {
    setStatusConfirm({ numeroCuenta, action, clienteInfo });
  };

  const filtered = cuentas.filter((cta) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const c = clienteMap[cta.clienteId];
    const clientName = c ? `${c.nombres} ${c.apellidos}`.toLowerCase() : '';
    return (
      (cta.numeroCuenta || '').toLowerCase().includes(q) ||
      clientName.includes(q) ||
      (cta.tipoCuenta || '').toLowerCase().includes(q) ||
      (cta.estado || '').toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
    const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
    return dateB - dateA;
  });

  const confirmLabels = {
    activar: {
      title: 'Activar Cuenta',
      message: '¿Está seguro de activar esta cuenta?',
      detail: 'La cuenta podrá realizar operaciones nuevamente.',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700',
      btnText: 'Activar',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    inactivar: {
      title: 'Inactivar Cuenta',
      message: '¿Está seguro de inactivar esta cuenta?',
      detail: 'La cuenta no podrá realizar transacciones hasta ser activada nuevamente.',
      btnClass: 'bg-slate-600 hover:bg-slate-700',
      btnText: 'Inactivar',
      icon: XCircle,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
    cancelar: {
      title: 'Cancelar Cuenta',
      message: '¿Está seguro de cancelar esta cuenta?',
      detail: 'Esta acción no se puede deshacer. La cuenta debe tener saldo $0.',
      btnClass: 'bg-danger hover:bg-red-600',
      btnText: 'Cancelar Cuenta',
      icon: AlertTriangle,
      iconColor: 'text-danger',
      iconBg: 'bg-red-100',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Cuentas Bancarias</h1>
          <p className="text-sm text-slate-500 mt-1">{cuentas.length} cuentas registradas</p>
        </div>
        {!isAuditor && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-banking-500 text-white font-medium hover:bg-banking-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Cuenta
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
          placeholder="Buscar por número de cuenta, cliente, tipo o estado..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-sm transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : cuentasError ? (
        <EmptyState title="Error al cargar cuentas" message={cuentasError} icon={Building2} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay cuentas'}
          message={search ? 'Intente con otros términos de búsqueda' : 'Cree la primera cuenta bancaria usando el botón "Nueva Cuenta"'}
          icon={search ? Search : CreditCard}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cta, i) => {
            const cliente = clienteMap[cta.clienteId];
            const isAhorros = cta.tipoCuenta === 'AHORROS';
            return (
              <div
                key={cta.id || i}
                className={`relative rounded-2xl overflow-hidden shadow-sm ${
                  isAhorros
                    ? 'bg-gradient-to-br from-banking-600 to-banking-800'
                    : 'bg-gradient-to-br from-slate-700 to-slate-900'
                }`}
              >
                {/* Estado Chip */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
                    {cta.estado === 'ACTIVA' ? 'Activa' : cta.estado === 'INACTIVA' ? 'Inactiva' : 'Cancelada'}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Tipo + Número */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                      {isAhorros ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
                    </p>
                    <p className="text-white font-mono text-lg tracking-wider">{cta.numeroCuenta || '—'}</p>
                  </div>

                  {/* Saldo */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Saldo Disponible</p>
                    <p className="text-white text-3xl font-bold">{formatCOP(cta.saldo)}</p>
                  </div>

                  {/* Cliente */}
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/80 text-sm font-medium">{getClienteName(cta.clienteId)}</p>
                    {cliente && (
                      <p className="text-white/40 text-xs">{cliente.tipoIdentificacion} {cliente.numeroIdentificacion}</p>
                    )}
                  </div>

                  {/* GMF Badge */}
                  {cta.exentaGMF && (
                    <div className="flex items-center gap-1.5 text-gold-400 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="font-medium">GMF Exenta</span>
                    </div>
                  )}

                  {/* Fecha creación */}
                  <p className="text-white/30 text-xs">Creada: {formatDate(cta.fechaCreacion)}</p>

                  {/* Actions */}
                  {!isAuditor && cta.estado !== 'CANCELADA' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      {cta.estado === 'ACTIVA' ? (
                        <>
                          <button
                            onClick={() => openStatusConfirm(cta.numeroCuenta, 'inactivar', getClienteName(cta.clienteId))}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                            title="Inactivar cuenta"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Inactivar
                          </button>
                          <button
                            onClick={() => openStatusConfirm(cta.numeroCuenta, 'cancelar', getClienteName(cta.clienteId))}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                            title="Cancelar cuenta"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </>
                      ) : cta.estado === 'INACTIVA' ? (
                        <button
                          onClick={() => openStatusConfirm(cta.numeroCuenta, 'activar', getClienteName(cta.clienteId))}
                          className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                          title="Activar cuenta"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Activar
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      <CuentaDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        clientes={clientes}
        onSuccess={() => { toast.success('Cuenta creada exitosamente'); loadData(); }}
      />

      {/* Status Confirmation Modal */}
      {statusConfirm && (() => {
        const cfg = confirmLabels[statusConfirm.action];
        const Icon = cfg.icon;
        return (
          <>
            <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50" onClick={() => setStatusConfirm(null)} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900">{cfg.title}</h3>
                    <p className="text-sm text-slate-500">Confirme esta operación</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-1">{cfg.message}</p>
                <p className="text-slate-500 text-sm mb-4">
                  Cuenta: <strong className="text-slate-700">{statusConfirm.numeroCuenta}</strong>
                </p>
                <p className="text-xs text-slate-400 mb-5">{cfg.detail}</p>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => setStatusConfirm(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleStatusAction} className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors ${cfg.btnClass}`}>
                    {cfg.btnText}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
