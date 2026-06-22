import { useState, useEffect, useRef } from 'react';
import {
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, History,
  Search, Loader2, CheckCircle2, ArrowRight, DollarSign, TrendingUp, TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { consignar, retirar, transferir, getTransaccionesByCuenta, getAllTransacciones } from '../../api/transaccionService';
import { getCuenta } from '../../api/cuentaService';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/useAuth';

const formatCOP = (num) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

const ALL_TABS = [
  { id: 'consignar', label: 'Consignar', icon: ArrowDownToLine },
  { id: 'retirar', label: 'Retirar', icon: ArrowUpFromLine },
  { id: 'transferir', label: 'Transferir', icon: ArrowLeftRight },
  { id: 'historial', label: 'Historial', icon: History },
];

const resolveTxDisplay = (tx) => {
  const tipo = tx.tipoTransaccion;
  if (tipo === 'CONSIGNACION') {
    return { dot: 'bg-emerald-500', bg: 'bg-emerald-50', label: 'Consignación', sign: '+', amountColor: 'text-emerald-600', icon: TrendingDown };
  }
  if (tipo === 'RETIRO') {
    return { dot: 'bg-red-500', bg: 'bg-red-50', label: 'Retiro', sign: '-', amountColor: 'text-red-600', icon: TrendingUp };
  }
  if (tipo === 'TRANSFERENCIA') {
    const saldoAnterior = Number(tx.saldoAnterior ?? 0);
    const saldoPosterior = Number(tx.saldoPosterior ?? 0);
    const isDebit = saldoAnterior > saldoPosterior;
    return {
      dot: isDebit ? 'bg-orange-500' : 'bg-blue-500',
      bg: isDebit ? 'bg-orange-50' : 'bg-blue-50',
      label: 'Transferencia',
      sign: isDebit ? '-' : '+',
      amountColor: isDebit ? 'text-red-600' : 'text-emerald-600',
      icon: ArrowLeftRight,
      isTransfer: true,
      isDebit,
    };
  }
  return { dot: 'bg-slate-400', bg: 'bg-slate-50', label: 'Transacción', sign: '', amountColor: 'text-slate-800', icon: ArrowLeftRight };
};

export default function TransaccionesPage() {
  const { isAuditor } = useAuth();
  const tabs = isAuditor ? ALL_TABS.filter((t) => t.id === 'historial') : ALL_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'historial');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const mountedRef = useRef(true);

  // Consignar / Retirar
  const [simpleForm, setSimpleForm] = useState({ numeroCuenta: '', monto: '' });
  const [accountPreview, setAccountPreview] = useState(null);

  // Transferir
  const [transferForm, setTransferForm] = useState({ cuentaOrigen: '', cuentaDestino: '', monto: '' });

  // Historial
  const [historialFilter, setHistorialFilter] = useState('');
  const [transacciones, setTransacciones] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const lookupAccount = async (numeroCuenta) => {
    if (!numeroCuenta || numeroCuenta.length < 4) { setAccountPreview(null); return; }
    try {
      const { data } = await getCuenta(numeroCuenta);
      setAccountPreview(data);
    } catch {
      setAccountPreview(null);
    }
  };

  const handleSimpleTransaction = async () => {
    const form = simpleForm;
    if (!form.numeroCuenta || !form.monto || Number(form.monto) <= 0) {
      toast.error('Complete todos los campos correctamente');
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'consignar') {
        await consignar({ numeroCuenta: form.numeroCuenta, monto: Number(form.monto) });
      } else {
        await retirar({ numeroCuenta: form.numeroCuenta, monto: Number(form.monto) });
      }
      setLastTx({
        tipo: activeTab === 'consignar' ? 'Consignación' : 'Retiro',
        cuenta: form.numeroCuenta,
        monto: Number(form.monto),
      });
      setSuccess(true);
      setSimpleForm({ numeroCuenta: '', monto: '' });
      setAccountPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al realizar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.cuentaOrigen || !transferForm.cuentaDestino || !transferForm.monto || Number(transferForm.monto) <= 0) {
      toast.error('Complete todos los campos correctamente');
      return;
    }
    setLoading(true);
    try {
      await transferir({
        cuentaOrigenNumero: transferForm.cuentaOrigen,
        cuentaDestinoNumero: transferForm.cuentaDestino,
        monto: Number(transferForm.monto),
      });
      setLastTx({
        tipo: 'Transferencia',
        cuenta: `${transferForm.cuentaOrigen} → ${transferForm.cuentaDestino}`,
        monto: Number(transferForm.monto),
      });
      setSuccess(true);
      setTransferForm({ cuentaOrigen: '', cuentaDestino: '', monto: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const resetSuccess = () => {
    setSuccess(false);
    setLastTx(null);
  };

  const loadAllTransacciones = async () => {
    setLoadingHistorial(true);
    try {
      const { data } = await getAllTransacciones();
      if (mountedRef.current) setTransacciones(Array.isArray(data) ? data : []);
    } catch {
      if (mountedRef.current) setTransacciones([]);
    } finally {
      if (mountedRef.current) setLoadingHistorial(false);
    }
  };

  const loadHistorialByCuenta = async () => {
    if (!historialFilter) {
      loadAllTransacciones();
      return;
    }
    setLoadingHistorial(true);
    try {
      const { data } = await getTransaccionesByCuenta(historialFilter);
      if (mountedRef.current) setTransacciones(Array.isArray(data) ? data : []);
    } catch {
      if (mountedRef.current) toast.error('Error al cargar historial');
      if (mountedRef.current) setTransacciones([]);
    } finally {
      if (mountedRef.current) setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'historial') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAllTransacciones();
    }
  }, [activeTab]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Transacciones</h1>
        <p className="text-sm text-slate-500 mt-1">Realice y consulte movimientos bancarios</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSuccess(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-banking-500 text-white'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success State */}
      {success && lastTx && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-1">¡Operación Exitosa!</h2>
            <p className="text-sm text-slate-500 mb-6">La transacción se ha completado correctamente</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tipo:</span>
                <span className="font-medium text-slate-800">{lastTx.tipo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Cuenta:</span>
                <span className="font-mono font-medium text-slate-800">{lastTx.cuenta}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monto:</span>
                <span className="font-bold font-mono text-emerald-600">+{formatCOP(lastTx.monto)}</span>
              </div>
            </div>
            <button onClick={resetSuccess} className="px-6 py-2.5 rounded-xl bg-banking-500 text-white font-medium hover:bg-banking-600 transition-colors">
              Nueva Operación
            </button>
          </div>
        </div>
      )}

      {!success && activeTab !== 'historial' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Consignar / Retirar */}
          {(activeTab === 'consignar' || activeTab === 'retirar') && (
            <div className="max-w-lg mx-auto space-y-5">
              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-xl ${activeTab === 'consignar' ? 'bg-emerald-100' : 'bg-red-100'} mb-3`}>
                  {activeTab === 'consignar'
                    ? <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
                    : <ArrowUpFromLine className="w-6 h-6 text-red-600" />
                  }
                </div>
                <h2 className="text-xl font-bold text-navy-900">
                  {activeTab === 'consignar' ? 'Consignar' : 'Retirar'} Dinero
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Cuenta</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simpleForm.numeroCuenta}
                    onChange={(e) => { setSimpleForm({ ...simpleForm, numeroCuenta: e.target.value }); lookupAccount(e.target.value); }}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none transition-all"
                    placeholder="Ingrese el número de cuenta"
                  />
                  <button
                    type="button"
                    onClick={() => lookupAccount(simpleForm.numeroCuenta)}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm"
                  >
                    Buscar
                  </button>
                </div>
                {accountPreview && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-8 h-8 rounded-lg bg-banking-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-banking-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{accountPreview.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente'}</p>
                      <p className="text-xs text-slate-400">Saldo: {formatCOP(accountPreview.saldo)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">COP $</span>
                  <input
                    type="number"
                    value={simpleForm.monto}
                    onChange={(e) => setSimpleForm({ ...simpleForm, monto: e.target.value })}
                    className="w-full pl-16 pr-4 py-4 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-2xl font-bold font-mono text-slate-800 text-center"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <button
                onClick={handleSimpleTransaction}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: activeTab === 'consignar' ? '#10B981' : '#EF4444',
                }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeTab === 'consignar' ? 'Consignar' : 'Retirar'}
              </button>
            </div>
          )}

          {/* Transferir */}
          {activeTab === 'transferir' && (
            <div className="max-w-lg mx-auto space-y-5">
              <div className="text-center mb-4">
                <div className="inline-flex p-3 rounded-xl bg-blue-100 mb-3">
                  <ArrowLeftRight className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-navy-900">Transferir Dinero</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Origen</label>
                <input
                  type="text"
                  value={transferForm.cuentaOrigen}
                  onChange={(e) => setTransferForm({ ...transferForm, cuentaOrigen: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none transition-all"
                  placeholder="Número de cuenta"
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-banking-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-banking-600" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Destino</label>
                <input
                  type="text"
                  value={transferForm.cuentaDestino}
                  onChange={(e) => setTransferForm({ ...transferForm, cuentaDestino: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none transition-all"
                  placeholder="Número de cuenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor a Transferir</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">COP $</span>
                  <input
                    type="number"
                    value={transferForm.monto}
                    onChange={(e) => setTransferForm({ ...transferForm, monto: e.target.value })}
                    className="w-full pl-16 pr-4 py-4 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-2xl font-bold font-mono text-slate-800 text-center"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <button
                onClick={handleTransfer}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-banking-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-banking-600 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Transferir'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      {activeTab === 'historial' && !success && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={historialFilter}
                onChange={(e) => setHistorialFilter(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadHistorialByCuenta(); }}
                placeholder="Buscar por número de cuenta..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={loadHistorialByCuenta} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-banking-500 text-white text-sm font-medium hover:bg-banking-600 transition-colors flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </button>
              <button onClick={loadAllTransacciones} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                Todas
              </button>
            </div>
          </div>

          {loadingHistorial ? (
            <TableSkeleton rows={4} cols={3} />
          ) : transacciones.length === 0 ? (
            <EmptyState title="Sin transacciones" message="No se encontraron movimientos" icon={History} />
          ) : (
            <>
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-0">
                  {[...transacciones]
                    .sort((a, b) => new Date(b.fecha || b.id) - new Date(a.fecha || a.id))
                    .map((tx, i) => {
                      const style = resolveTxDisplay(tx);
                      return (
                        <div key={tx.id || i} className="relative flex gap-4 pb-6">
                          <div className="relative z-10 mt-1">
                            <div className={`w-[10px] h-[10px] rounded-full ${style.dot} ring-4 ring-white`} />
                          </div>
                          <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{style.label}</p>
                                <p className="text-xs text-slate-400">{formatDate(tx.fecha)}</p>
                              </div>
                              <p className={`text-lg font-bold font-mono ${style.amountColor}`}>
                                {style.sign}{formatCOP(tx.monto)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                              <span>Cuenta: <span className="font-mono font-medium text-slate-700">{tx.numeroCuenta}</span></span>
                              {style.isTransfer && tx.numeroCuentaRelacionada && (
                                <span>
                                  {style.isDebit ? 'Destino' : 'Origen'}: <span className="font-mono font-medium text-slate-700">{tx.numeroCuentaRelacionada}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                              <span className="text-slate-400">Saldo ant.: <span className="font-medium text-slate-500">{formatCOP(tx.saldoAnterior ?? 0)}</span></span>
                              <ArrowRight className="w-3 h-3 text-slate-300" />
                              <span className="text-slate-400">Saldo actual: <span className="font-bold text-slate-700">{formatCOP(tx.saldoPosterior ?? 0)}</span></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
