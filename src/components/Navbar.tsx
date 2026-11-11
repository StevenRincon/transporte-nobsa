import React from 'react';
import { Shield, Lock, LogOut, LayoutDashboard, FileSpreadsheet, MapPin, School, History, User } from 'lucide-react';
import { NobsaLogo } from './NobsaLogo';

interface NavbarProps {
  currentView: 'citizen' | 'admin';
  adminTab: 'dashboard' | 'inscriptions' | 'bus-stops' | 'institutions' | 'audit';
  adminUser: any | null;
  onSelectView: (view: 'citizen' | 'admin') => void;
  onSelectAdminTab: (tab: 'dashboard' | 'inscriptions' | 'bus-stops' | 'institutions' | 'audit') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  adminTab,
  adminUser,
  onSelectView,
  onSelectAdminTab,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm print:hidden">
      {/* Top Colombian / Institutional Flag Accent Line */}
      <div className="h-1.5 w-full flex">
        <div className="h-full bg-amber-400 w-1/2" />
        <div className="h-full bg-blue-700 w-1/4" />
        <div className="h-full bg-red-600 w-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Emblem */}
          <div 
            onClick={() => onSelectView('citizen')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <NobsaLogo className="h-14 w-auto group-hover:scale-105 transition-transform" />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {currentView === 'citizen' ? (
              <button
                onClick={() => onSelectView('admin')}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">Acceso Funcionarios</span>
                <span className="sm:hidden">Admin</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onSelectView('citizen')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  &larr; Volver al Portal Ciudadano
                </button>

                {adminUser && (
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div className="hidden md:flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {adminUser.name}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 uppercase">
                        {adminUser.role === 'ADMIN' ? 'Administrador TIC' : 'Funcionario Educación'}
                      </span>
                    </div>

                    <button
                      onClick={onLogout}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Cerrar Sesión Segura"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admin Tabs Bar (when in admin view and authenticated) */}
        {currentView === 'admin' && adminUser && (
          <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            <button
              onClick={() => onSelectAdminTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Panel de Control
            </button>

            <button
              onClick={() => onSelectAdminTab('inscriptions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'inscriptions'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Inscripciones y Registros
            </button>

            <button
              onClick={() => onSelectAdminTab('bus-stops')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'bus-stops'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Paraderos (44)
            </button>

            <button
              onClick={() => onSelectAdminTab('institutions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'institutions'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              Instituciones y Sedes
            </button>

            <button
              onClick={() => onSelectAdminTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'audit'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Auditoría
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
