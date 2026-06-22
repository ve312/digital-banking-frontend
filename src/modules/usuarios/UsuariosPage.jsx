import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Shield, Key, Loader2, AlertTriangle, Edit2, Trash2, ShieldBan } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, changePassword } from '../../api/usuarioService';
import { useAuth } from '../../context/useAuth';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

const roleChipStyles = {
  ADMIN: 'bg-gold-500/20 text-gold-600',
  ASESOR: 'bg-banking-500/20 text-banking-600',
  AUDITOR: 'bg-slate-500/20 text-slate-500',
};

export default function UsuariosPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', username: '', password: '', rol: 'ASESOR' });
  const [submitting, setSubmitting] = useState(false);
  const [passwordModal, setPasswordModal] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [inactivateConfirm, setInactivateConfirm] = useState(null);
  const [inactivating, setInactivating] = useState(false);
  const mountedRef = useRef(true);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await getUsuarios();
      if (mountedRef.current) setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      if (mountedRef.current) { toast.error('Error al cargar usuarios'); setUsuarios([]); }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsuarios();
    return () => { mountedRef.current = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.username.trim()) {
      toast.error('Nombre, apellido y usuario son obligatorios');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error('La contraseña es obligatoria');
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, { nombre: form.nombre, apellido: form.apellido, rol: form.rol, activo: editingUser.activo !== undefined ? editingUser.activo : true });
        toast.success('Usuario actualizado');
      } else {
        await createUsuario({ username: form.username, password: form.password, nombre: form.nombre, apellido: form.apellido, rol: form.rol });
        toast.success('Usuario creado');
      }
      setFormOpen(false);
      setEditingUser(null);
      setForm({ nombre: '', apellido: '', username: '', password: '', rol: 'ASESOR' });
      loadUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (id) => {
    const user = usuarios.find((u) => u.id === id);
    if (!user) return;
    if (user.activo !== false) {
      setInactivateConfirm(user);
    } else {
      handleConfirmInactivate(user);
    }
  };

  const handleConfirmInactivate = async (user) => {
    setInactivating(true);
    try {
      await updateUsuario(user.id, { nombre: user.nombre, apellido: user.apellido, rol: user.rol, activo: user.activo === false });
      toast.success(user.activo !== false ? 'Usuario inactivado' : 'Usuario activado');
      setInactivateConfirm(null);
      loadUsuarios();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setInactivating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      await changePassword(passwordModal.id, { nuevaPassword: passwordForm.newPassword });
      toast.success('Contraseña actualizada');
      setPasswordModal(null);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Error al cambiar contraseña');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsuario(id);
      toast.success('Usuario eliminado');
      setDeleteConfirm(null);
      loadUsuarios();
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ nombre: user.nombre, apellido: user.apellido, username: user.username, password: '', rol: user.rol });
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ nombre: '', apellido: '', username: '', password: '', rol: 'ASESOR' });
    setFormOpen(true);
  };

  const filtered = usuarios.filter(
    (u) => {
      const fullName = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
      return fullName.includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
    }
  );

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-banking-500 text-white font-medium hover:bg-banking-600 transition-colors">
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o usuario..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-banking-500 focus:ring-2 focus:ring-banking-500/10 outline-none text-sm transition-all"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title={search ? 'Sin resultados' : 'No hay usuarios'} message={search ? 'Intente con otros términos' : 'Cree su primer usuario'} icon={Shield} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const chipClass = roleChipStyles[user.rol] || 'bg-slate-500/20 text-slate-500';
                  return (
                    <tr key={user.id || i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150 group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">#{user.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{user.nombre} {user.apellido}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${chipClass}`}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-flex">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={currentUser?.username === user.username && user.activo !== false}
                            className={`inline-flex items-center gap-2 ${currentUser?.username === user.username && user.activo !== false ? 'cursor-not-allowed opacity-60' : ''}`}
                          >
                            <span className={`relative inline-block w-9 h-5 rounded-full transition-colors duration-200 ${user.activo !== false ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${user.activo !== false ? 'translate-x-4' : ''}`} />
                            </span>
                            <span className={`text-xs font-medium ${user.activo !== false ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {user.activo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </button>
                          {currentUser?.username === user.username && user.activo !== false && (
                            <span className="absolute -top-1 -right-1 w-4 h-4">
                              <ShieldBan className="w-4 h-4 text-danger cursor-help" title="No puedes inactivar tu propio usuario" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="p-2 rounded-lg text-slate-400 hover:text-amber-500 transition-colors" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setPasswordModal(user); setPasswordForm({ newPassword: '', confirmPassword: '' }); }} className="p-2 rounded-lg text-slate-400 hover:text-banking-500 transition-colors opacity-0 group-hover:opacity-100" title="Cambiar contraseña">
                            <Key className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(user)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Drawer */}
      {formOpen && (
        <>
          <div className="fixed inset-0 bg-navy-900/30 backdrop-blur-sm z-40" onClick={() => { setFormOpen(false); setEditingUser(null); }} />
          <div className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-navy-900">
              <h2 className="text-lg font-bold text-white">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => { setFormOpen(false); setEditingUser(null); }} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="Nombres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                <input type="text" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="Apellidos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'ADMIN', label: 'Admin', borderActive: 'border-gold-500', bgActive: 'bg-gold-500/10', textActive: 'text-gold-600' },
                    { value: 'ASESOR', label: 'Asesor', borderActive: 'border-banking-500', bgActive: 'bg-banking-500/10', textActive: 'text-banking-600' },
                    { value: 'AUDITOR', label: 'Auditor', borderActive: 'border-slate-500', bgActive: 'bg-slate-500/10', textActive: 'text-slate-600' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, rol: opt.value })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.rol === opt.value ? `${opt.borderActive} ${opt.bgActive}` : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <Shield className={`w-5 h-5 mx-auto mb-1 ${form.rol === opt.value ? opt.textActive : 'text-slate-400'}`} />
                      <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="••••••••" />
              </div>
            </form>
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
              <button type="button" onClick={() => { setFormOpen(false); setEditingUser(null); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" onClick={handleSubmit} disabled={submitting} className="px-5 py-2.5 rounded-xl bg-banking-500 text-white font-medium flex items-center gap-2 hover:bg-banking-600 transition-colors disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Change Password Modal */}
      {passwordModal && (
        <>
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50" onClick={() => setPasswordModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-banking-100 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-banking-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Cambiar Contraseña</h3>
                  <p className="text-xs text-slate-500">{passwordModal.nombre} {passwordModal.apellido}</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-1 focus:ring-banking-500/20 outline-none transition-all" placeholder="Repita la contraseña" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setPasswordModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-banking-500 text-white font-medium text-sm hover:bg-banking-600 transition-colors">Cambiar Contraseña</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Eliminar Usuario</h3>
                  <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6">¿Está seguro de eliminar a <strong>{deleteConfirm.nombre} {deleteConfirm.apellido}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2.5 rounded-xl bg-danger text-white font-medium hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Inactivate Confirmation Modal */}
      {inactivateConfirm && (
        <>
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50" onClick={() => !inactivating && setInactivateConfirm(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldBan className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900">Inactivar Usuario</h3>
                  <p className="text-sm text-slate-500">Acción administrativa sensible</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-2">
                ¿Estás seguro de que deseas inactivar a <strong>{inactivateConfirm.nombre} {inactivateConfirm.apellido}</strong>?
              </p>
              <p className="text-slate-500 text-xs mb-6">
                El usuario perderá la capacidad de iniciar sesión en el sistema hasta que sea activado nuevamente.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setInactivateConfirm(null)}
                  disabled={inactivating}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmInactivate(inactivateConfirm)}
                  disabled={inactivating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-medium flex items-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-60"
                >
                  {inactivating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar inactivación
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
