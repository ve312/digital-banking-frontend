export function StatusBadge({ status }) {
  const styles = {
    ACTIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    ACTIVO: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    INACTIVA: 'bg-slate-100 text-slate-600 border-slate-300',
    INACTIVO: 'bg-slate-100 text-slate-600 border-slate-300',
    CANCELADA: 'bg-red-50 text-red-700 border-red-200',
    CANCELADO: 'bg-red-50 text-red-700 border-red-200',
    ADMIN: 'bg-red-50 text-red-700 border-red-200',
    ASESOR: 'bg-blue-50 text-blue-700 border-blue-200',
    AUDITOR: 'bg-purple-50 text-purple-700 border-purple-200',
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    APROBADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZADA: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    ACTIVA: 'Activa', ACTIVO: 'Activo',
    INACTIVA: 'Inactiva', INACTIVO: 'Inactivo',
    CANCELADA: 'Cancelada', CANCELADO: 'Cancelado',
    ADMIN: 'Admin', ASESOR: 'Asesor', AUDITOR: 'Auditor',
    PENDIENTE: 'Pendiente', APROBADA: 'Aprobada', RECHAZADA: 'Rechazada',
  };

  const s = typeof status === 'string' ? status.toUpperCase() : status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[s] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s === 'ACTIVA' || s === 'ACTIVO' ? 'bg-emerald-500' : s === 'INACTIVA' || s === 'INACTIVO' ? 'bg-slate-400' : s === 'CANCELADA' || s === 'CANCELADO' ? 'bg-red-500' : 'bg-current'}`} />
      {labels[s] || status}
    </span>
  );
}

export function TipoCuentaBadge({ tipo }) {
  const styles = {
    AHORROS: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    CORRIENTE: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[tipo?.toUpperCase()] || 'bg-slate-500 text-white'}`}>
      {tipo?.toUpperCase() === 'AHORROS' ? 'Ahorros' : tipo?.toUpperCase() === 'CORRIENTE' ? 'Corriente' : tipo}
    </span>
  );
}
