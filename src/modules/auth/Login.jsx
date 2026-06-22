import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import heroBg from '/src/assets/hero-city-banking.jpg';
import shieldImg from '/src/assets/trust-security-shield.jpg';
import logoWhite from '/src/assets/bank-logo-white.PNG';
import bankLogo from '/src/assets/bank-logo.png';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Hero Image with solid overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-900/80" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <img src={logoWhite} alt="ProjectBank" className="h-10 w-auto" />
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">Banca Global<br />Sin Límites</h1>
            <p className="text-white/70 text-lg leading-relaxed">Gestione sus cuentas, realice transacciones y monitoree su patrimonio desde una plataforma segura e innovadora.</p>
            <div className="mt-8 flex items-center gap-3 text-white/60 text-sm">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
              <span>Protegido con cifrado de 256 bits</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <img src={shieldImg} alt="" className="w-6 h-6 rounded-full object-cover opacity-60" />
            <span>Certificado SSL · Seguridad de nivel bancario</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Clean slate-50 with form card */}
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-[420px]">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="text-center mb-8">
              <img src={bankLogo} alt="ProjectBank" className="h-9 w-auto mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-navy-900">Iniciar Sesión</h2>
              <p className="text-sm text-slate-500 mt-1">Acceda a su panel de control bancario</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400" placeholder="Ingrese su usuario" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-banking-500 focus:ring-2 focus:ring-banking-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 pr-12" placeholder="Ingrese su contraseña" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-banking-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-banking-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Acceder<ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <img src={shieldImg} alt="" className="w-5 h-5 rounded object-cover" />
            <span>Conexión cifrada 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
