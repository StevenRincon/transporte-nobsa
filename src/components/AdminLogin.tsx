import React, { useState } from 'react';
import { Lock, User, Key, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { NobsaLogo } from './NobsaLogo';

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToPublic }) => {
  const [username, setUsername] = useState('admin_nobsa');
  const [password, setPassword] = useState('Nobsa2027*');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      localStorage.setItem('nobsa_admin_token', data.token);
      localStorage.setItem('nobsa_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-8 text-center relative">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center p-2 border border-white/20 shadow-lg">
              <NobsaLogo className="w-12 h-12" variant="shield" />
            </div>
          </div>
          <h2 className="text-xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">
            Acceso Administrativo
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Plataforma Institucional de Transporte Escolar 2027
          </p>
          <span className="inline-block mt-3 px-3 py-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-400/30">
            Alcaldía Municipal de Nobsa
          </span>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuario institucional
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario asignado"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Iniciar Sesión Segura
            </button>
          </form>

          {/* Quick Demo Credentials Pill for authorized testing */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Credenciales de prueba preconfiguradas:
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCredentials('admin_nobsa', 'Nobsa2027*')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. Administrador TIC</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Rol ADMIN</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  admin_nobsa / Nobsa2027*
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCredentials('funcionario_nobsa', 'Funcionario2027*')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">2. Funcionario Educación</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Rol FUNCIONARIO</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  funcionario_nobsa / Funcionario2027*
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToPublic}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Regresar al Formulario Público Ciudadano
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
