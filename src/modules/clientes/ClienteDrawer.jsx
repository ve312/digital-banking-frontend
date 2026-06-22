import { useState } from 'react';
import { X, Loader2, User, FileText, AtSign, Calendar, Hash } from 'lucide-react';
import { createCliente, updateCliente } from '../../api/clienteService';

const initForm = (cliente) => cliente ? {
  nombres: cliente.nombres || '',
  apellidos: cliente.apellidos || '',
  tipoIdentificacion: cliente.tipoIdentificacion || 'CC',
  numeroIdentificacion: cliente.numeroIdentificacion || '',
  email: cliente.email || '',
  fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
} : {
  nombres: '', apellidos: '', tipoIdentificacion: 'CC', numeroIdentificacion: '', email: '', fechaNacimiento: '',
};

export default function ClienteDrawer({ open, onClose, cliente, onSuccess }) {
  const [form, setForm] = useState(() => initForm(cliente));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!cliente;

  const validate = () => {
    const errs = {};
    if (!form.nombres.trim()) errs.nombres = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios';
    if (!isEditing) {
      if (!form.numeroIdentificacion.trim()) errs.numeroIdentificacion = 'El número de identificación es obligatorio';
      if (!form.fechaNacimiento) errs.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCliente(cliente.id, {
          nombres: form.nombres,
          apellidos: form.apellidos,
          email: form.email,
        });
      } else {
        await createCliente({
          tipoIdentificacion: form.tipoIdentificacion,
          numeroIdentificacion: form.numeroIdentificacion,
          nombres: form.nombres,
          apellidos: form.apellidos,
          email: form.email,
          fechaNacimiento: form.fechaNacimiento,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Error al guardar el cliente' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-navy-900">
          <h2 className="text-lg font-bold text-white">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Nombres
              </label>
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.nombres ? 'border-danger ring-2 ring-danger/10' : 'border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20'}`}
                placeholder="Nombres"
              />
              {errors.nombres && <p className="text-xs text-danger mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Apellidos
              </label>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.apellidos ? 'border-danger ring-2 ring-danger/10' : 'border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20'}`}
                placeholder="Apellidos"
              />
              {errors.apellidos && <p className="text-xs text-danger mt-1">{errors.apellidos}</p>}
            </div>
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <FileText className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                  Tipo Ident.
                </label>
                <select
                  value={form.tipoIdentificacion}
                  onChange={(e) => setForm({ ...form, tipoIdentificacion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all bg-white"
                >
                  <option value="CC">Cédula Ciudadanía</option>
                  <option value="CE">Cédula Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Hash className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                  Número Ident.
                </label>
                <input
                  type="text"
                  value={form.numeroIdentificacion}
                  onChange={(e) => setForm({ ...form, numeroIdentificacion: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.numeroIdentificacion ? 'border-danger ring-2 ring-danger/10' : 'border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20'}`}
                  placeholder="1234567890"
                />
                {errors.numeroIdentificacion && <p className="text-xs text-danger mt-1">{errors.numeroIdentificacion}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <AtSign className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.email ? 'border-danger ring-2 ring-danger/10' : 'border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20'}`}
              placeholder="cliente@correo.com"
            />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${errors.fechaNacimiento ? 'border-danger ring-2 ring-danger/10' : 'border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20'}`}
              />
              {errors.fechaNacimiento && <p className="text-xs text-danger mt-1">{errors.fechaNacimiento}</p>}
            </div>
          )}

          {errors.submit && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{errors.submit}</div>
          )}
        </form>

        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-banking-500 text-white font-medium flex items-center gap-2 hover:bg-banking-600 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Actualizar' : 'Crear Cliente'}
          </button>
        </div>
      </div>
    </>
  );
}
