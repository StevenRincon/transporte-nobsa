import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  MapPin, 
  School, 
  GraduationCap, 
  TrendingUp, 
  Filter, 
  RefreshCw,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { DashboardStats, EducationalInstitution } from '../types';

interface AdminDashboardProps {
  token: string;
  institutions: EducationalInstitution[];
  onNavigateToInscriptions: (filter?: { institution?: string; status?: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  institutions,
  onNavigateToInscriptions,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar estadísticas.');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading && !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">
          Cargando métricas y análisis de transporte 2027...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200 text-red-600">
        <p className="font-bold">{error || 'No se pudieron obtener las estadísticas.'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const maxInstCount = Math.max(...stats.byInstitution.map(i => i.count), 1);
  const maxGradeCount = Math.max(...stats.byGrade.map(g => g.count), 1);
  const maxStopCount = Math.max(...stats.byBusStop.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Panel de Control Estratégico · Vigencia 2027
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Monitoreo y Cobertura de Transporte Escolar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Municipio de Nobsa, Boyacá · Datos consolidados en tiempo real
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Estadísticas
        </button>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inscriptions */}
        <div 
          onClick={() => onNavigateToInscriptions()}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inscritos
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              {stats.totalInscriptions}
            </span>
            <span className="text-xs text-slate-500 ml-2">registros en plataforma</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-blue-700">
            Ver todas las inscripciones &rarr;
          </div>
        </div>

        {/* Continuing */}
        <div 
          onClick={() => onNavigateToInscriptions({ status: 'CONTINUA' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Desean Continuar
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">
              {stats.continuingCount}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              ({stats.totalInscriptions > 0 ? Math.round((stats.continuingCount / stats.totalInscriptions) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-700">
            Cupos activos para rutas 2027 &rarr;
          </div>
        </div>

        {/* Not Continuing */}
        <div 
          onClick={() => onNavigateToInscriptions({ status: 'NO_CONTINUA' })}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              No Continuarán
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-700">
              {stats.notContinuingCount}
            </span>
            <span className="text-xs text-slate-500 ml-2">estudiantes</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-600">
            Consultar constancias &rarr;
          </div>
        </div>

        {/* Active Bus Stops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paraderos Oficiales
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600">
              44
            </span>
            <span className="text-xs text-slate-500 ml-2">puntos censados</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-amber-700">
            Excel original verificado 100%
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes por Institución Educativa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Estudiantes por Institución Educativa
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Distribución</span>
          </div>

          <div className="space-y-3.5">
            {stats.byInstitution.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay registros aún.</p>
            ) : (
              stats.byInstitution.map((item, idx) => {
                const percentage = Math.round((item.count / maxInstCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        {item.count} est.
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Estudiantes por Grado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Estudiantes por Grado Escolar (2027)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Nivel Escolar</span>
          </div>

          <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {stats.byGrade.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay registros aún.</p>
            ) : (
              stats.byGrade.map((item, idx) => {
                const percentage = Math.round((item.count / maxGradeCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {item.grade}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Paraderos con Mayor Demanda */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Demanda de Transporte por Paradero (Top Puntos de Abordaje)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Planeación de capacidad vehicular
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.byBusStop.slice(0, 9).map((stop, idx) => (
              <div
                key={stop.id}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-amber-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate" title={stop.name}>
                    {stop.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs font-black font-mono text-amber-700">
                  {stop.count} <span className="text-[10px] font-normal text-slate-500">est.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
