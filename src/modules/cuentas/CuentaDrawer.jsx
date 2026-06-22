import { useState } from 'react';
import { X, Loader2, CreditCard, DollarSign, Search, Shield } from 'lucide-react';
import { createCuenta } from '../../api/cuentaService';

export default function CuentaDrawer({ open, onClose, clientes, onSuccess }) {
  const [searchCliente, setSearchCliente] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [tipoCuenta, setTipoCuenta] = useState('AHORROS');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [exentaGMF, setExentaGMF] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setSearchCliente('');
    setSelectedCliente(null);
    setTipoCuenta('AHORROS');
    setSaldoInicial('');
    setExentaGMF(false);
    setError('');
  };

  const filteredClientes = clientes.filter((c) => {
    const fullName = `${c.nombres || ''} ${c.apellidos || ''}`.toLowerCase();
    return fullName.includes(searchCliente.toLowerCase()) || c.numeroIdentificacion?.includes(searchCliente);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCliente) {
      setError('Debe seleccionar un cliente');
      return;
    }
    if (!saldoInicial || Number(saldoInicial) < 0) {
      setError('Ingrese un saldo inicial válido');
      return;
    }

    setSubmitting(true);
    try {
      await createCuenta({
        clienteId: selectedCliente.id,
        tipoCuenta,
        saldoInicial: Number(saldoInicial),
        exentaGMF,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm z-40" onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-navy-900">
          <h2 className="text-lg font-bold text-white">Nueva Cuenta Bancaria</h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Search className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
              Cliente Titular
            </label>
            {selectedCliente ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-banking-50 border border-banking-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-banking-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {(selectedCliente.nombres || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedCliente.nombres} {selectedCliente.apellidos}</p>
                    <p className="text-xs text-slate-500">{selectedCliente.tipoIdentificacion} {selectedCliente.numeroIdentificacion}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedCliente(null); setSearchCliente(''); }} className="text-xs text-banking-600 hover:text-banking-800 font-medium">
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  placeholder="Buscar cliente por nombre o documento..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all text-sm"
                />
                {searchCliente && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredClientes.length === 0 ? (
                      <div className="p-3 text-center text-sm text-slate-500">No se encontraron clientes</div>
                    ) : (
                      filteredClientes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setSelectedCliente(c); setSearchCliente(''); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-banking-100 flex items-center justify-center text-banking-600 font-bold text-xs">{(c.nombres || 'C').charAt(0)}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.nombres} {c.apellidos}</p>
                            <p className="text-xs text-slate-400">{c.tipoIdentificacion} {c.numeroIdentificacion}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
              Tipo de Cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['AHORROS', 'CORRIENTE'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoCuenta(tipo)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    tipoCuenta === tipo
                      ? 'border-banking-500 bg-banking-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-2 ${tipoCuenta === tipo ? 'text-banking-500' : 'text-slate-400'}`} />
                  <p className="font-semibold text-sm text-slate-800">{tipo === 'AHORROS' ? 'Ahorros' : 'Corriente'}</p>
                  <p className="text-[11px] text-slate-400">{tipo === 'AHORROS' ? 'Genera intereses' : 'Cheques y transacciones'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
              Saldo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
              <input
                type="number"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/20 outline-none transition-all text-lg font-bold text-slate-800"
                placeholder="0"
                min="0"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Valor en pesos colombianos (COP)</p>
          </div>

          {/* GMF Exemption */}
          <div>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={exentaGMF}
                onChange={(e) => setExentaGMF(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-banking-500 focus:ring-banking-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Exenta de GMF</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">La cuenta no tendrá el Gravamen a los Movimientos Financieros</p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
        </form>

        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-banking-500 text-white font-medium flex items-center gap-2 hover:bg-banking-600 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear Cuenta
          </button>
        </div>
      </div>
    </>
  );
}
