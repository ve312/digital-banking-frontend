import { useState, useEffect, useRef } from 'react';
import {
  Users, Building2, ArrowUpRight, Wallet, RefreshCw, History,
} from 'lucide-react';
import { getClientes } from '../../api/clienteService';
import { getAllCuentas } from '../../api/cuentaService';
import { getAllTransacciones } from '../../api/transaccionService';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import statsBg from '/src/assets/stats-bg-abstract.jpg';
import servicePersonal from '/src/assets/service-personal-banking.jpg';
import serviceInvestments from '/src/assets/service-investments.jpg';
import serviceDigital from '/src/assets/service-digital.jpg';
import serviceBusiness from '/src/assets/service-business-banking.jpg';
import newsSust from '/src/assets/news-sustainability.jpg';
import newsInvest from '/src/assets/news-investment.jpg';
import newsDigital from '/src/assets/news-digital-banking.jpg';

const formatCOP = (num) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
};

const resolveTxDisplay = (tx) => {
  const tipo = tx.tipoTransaccion;
  if (tipo === 'CONSIGNACION') {
    return { dot: 'bg-emerald-500', label: 'Consignación', sign: '+', amountColor: 'text-emerald-600', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' };
  }
  if (tipo === 'RETIRO') {
    return { dot: 'bg-red-500', label: 'Retiro', sign: '-', amountColor: 'text-red-600', iconColor: 'text-red-600', iconBg: 'bg-red-100' };
  }
  if (tipo === 'TRANSFERENCIA') {
    const saldoAnterior = Number(tx.saldoAnterior ?? 0);
    const saldoPosterior = Number(tx.saldoPosterior ?? 0);
    const isDebit = saldoAnterior > saldoPosterior;
    return {
      dot: isDebit ? 'bg-orange-500' : 'bg-blue-500',
      label: 'Transferencia',
      sign: isDebit ? '-' : '+',
      amountColor: isDebit ? 'text-red-600' : 'text-emerald-600',
      iconColor: isDebit ? 'text-orange-600' : 'text-blue-600',
      iconBg: isDebit ? 'bg-orange-100' : 'bg-blue-100',
      isTransfer: true,
      isDebit,
    };
  }
  return { dot: 'bg-slate-400', label: 'Transacción', sign: '', amountColor: 'text-slate-800', iconColor: 'text-slate-400', iconBg: 'bg-slate-100' };
};

const services = [
  { title: 'Banca Personal', img: servicePersonal },
  { title: 'Inversiones', img: serviceInvestments },
  { title: 'Banca Digital', img: serviceDigital },
  { title: 'Banca Empresarial', img: serviceBusiness },
];

const news = [
  { title: 'Sostenibilidad y Banca Verde', date: '15 Jun 2026', img: newsSust },
  { title: 'Nuevo Fondo de Inversión', date: '12 Jun 2026', img: newsInvest },
  { title: 'Transformación Digital 2026', date: '10 Jun 2026', img: newsDigital },
];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [txError, setTxError] = useState(null);
  const mountedRef = useRef(true);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setTxError(null);
    try {
      const [clientesRes, cuentasRes, txRes] = await Promise.allSettled([
        getClientes(), getAllCuentas(), getAllTransacciones(),
      ]);
      if (!mountedRef.current) return;
      const clientes = clientesRes.status === 'fulfilled' ? (clientesRes.value.data || []) : [];
      const cuentas = cuentasRes.status === 'fulfilled' ? (cuentasRes.value.data || []) : [];
      const transacciones = txRes.status === 'fulfilled' ? (txRes.value.data || []) : [];
      const totalClientes = Array.isArray(clientes) ? clientes.length : 0;
      const totalCuentas = Array.isArray(cuentas) ? cuentas.length : 0;
      const cuentasActivas = Array.isArray(cuentas) ? cuentas.filter((c) => c.estado === 'ACTIVA').length : 0;
      const totalTransacciones = Array.isArray(transacciones) ? transacciones.length : 0;
      let saldoTotal = 0;
      if (Array.isArray(cuentas)) saldoTotal = cuentas.reduce((sum, c) => sum + (c.saldo || 0), 0);
      setStats({ totalClientes, totalCuentas, cuentasActivas, totalTransacciones, saldoTotal });
      if (Array.isArray(transacciones)) {
        const sorted = [...transacciones].sort((a, b) => new Date(b.fecha || b.id) - new Date(a.fecha || a.id));
        setRecentTx(sorted.slice(0, 5));
      }
      if (clientesRes.status === 'rejected') setError('Error al cargar clientes');
      if (cuentasRes.status === 'rejected') setError('Error al cargar cuentas');
      if (txRes.status === 'rejected') setTxError('Error al cargar transacciones');
    } catch {
      if (mountedRef.current) setError('Error al cargar datos del dashboard');
    } finally {
      if (mountedRef.current) { setLoading(false); setRefreshing(false); }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    return () => { mountedRef.current = false; };
  }, []);

  const statCards = [
    { label: 'Total Clientes', value: stats?.totalClientes ?? '—', icon: Users },
    { label: 'Total Cuentas', value: stats?.totalCuentas ?? '—', icon: Building2 },
    { label: 'Cuentas Activas', value: stats?.cuentasActivas ?? '—', icon: Wallet },
    { label: 'Transacciones', value: stats?.totalTransacciones ?? '—', icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero: Background + KPI Stats */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img src={statsBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-900/70" />
        </div>
        <div className="relative z-10 py-12 px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
              <p className="text-white/60 text-sm mt-1">Resumen general del sistema</p>
            </div>
            <button onClick={() => loadData(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-60 border border-white/10">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          {loading ? (<CardSkeleton />) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-white/60 text-sm mb-3">{error}</p>
              <button onClick={() => loadData()} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">Reintentar</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                    <p className="text-4xl font-bold font-mono text-white">{card.value}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 shrink-0">
                    <card.icon className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Nuestros Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer">
              <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm">{s.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-navy-900">Transacciones Recientes</h2>
          </div>
          {stats?.totalTransacciones > 0 && (<span className="text-xs text-slate-400">{stats.totalTransacciones} en total</span>)}
        </div>
        {loading ? (<div className="p-6"><TableSkeleton rows={4} cols={4} /></div>) : txError ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-slate-500 text-sm">{txError}</p>
          </div>
        ) : recentTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <History className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTx.map((tx, i) => {
              const style = resolveTxDisplay(tx);
              return (
                <div key={tx.id || i} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{style.label}</p>
                      <p className="text-xs text-slate-400">{formatDate(tx.fecha)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-sm font-bold font-mono ${style.amountColor}`}>{style.sign}{formatCOP(tx.monto)}</p>
                    {tx.numeroCuenta && (<p className="text-[11px] text-slate-400 font-mono">{tx.numeroCuenta}</p>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* News Section */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Actualidad Bancaria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((n, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden h-56 group cursor-pointer">
              <img src={n.img} alt={n.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white/60 text-xs mb-1">{n.date}</p>
                <h3 className="text-white font-semibold text-sm leading-tight">{n.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
