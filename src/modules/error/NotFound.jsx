import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6">
          <FileQuestion className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-6xl font-bold text-navy-900 mb-2">404</h1>
        <p className="text-xl text-slate-600 mb-6">Página no encontrada</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
