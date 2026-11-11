import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  Users, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { BusStop } from '../types';

interface AdminBusStopsProps {
  token: string;
  onRefreshStops: () => void;
}

export const AdminBusStops: React.FC<AdminBusStopsProps> = ({ token, onRefreshStops }) => {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newStopNote, setNewStopNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bus-stops', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStops(data.busStops || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, [token]);

  const handleToggleActive = async (stop: BusStop) => {
    try {
      const res = await fetch(`/api/admin/bus-stops/${stop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !stop.active }),
      });
      if (res.ok) {
        fetchStops();
        onRefreshStops();
      }
    } catch (e) {
      alert('Error al cambiar estado del paradero');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStop || !editingStop.name.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bus-stops/${editingStop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingStop.name,
          operationalNote: editingStop.operationalNote,
        }),
      });
      if (res.ok) {
        setEditingStop(null);
        fetchStops();
        onRefreshStops();
      }
    } catch (e) {
      alert('Error al guardar paradero');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bus-stops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newStopName.trim(),
          operationalNote: newStopNote.trim(),
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewStopName('');
        setNewStopNote('');
        fetchStops();
        onRefreshStops();
      }
    } catch (e) {
      alert('Error al crear paradero');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStops = stops.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.operationalNote && s.operationalNote.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Infraestructura y Rutas de Transporte 2027
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Gestión Integral de Paraderos Escolares
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de los 44 puntos oficiales censados, activación y demanda asociada
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paradero
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de paradero o sector..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-500">
            Total censados: <strong className="text-slate-900">{stops.length}</strong>
          </span>
          <span className="text-emerald-700 font-semibold">
            Activos en formulario: <strong>{stops.filter(s => s.active).length}</strong>
          </span>
        </div>
      </div>

      {/* Grid of Stops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Cargando paraderos...
          </div>
        ) : filteredStops.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No se encontraron paraderos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredStops.map((stop) => (
            <div
              key={stop.id}
              className={`p-4 rounded-2xl border transition-all ${
                stop.active
                  ? 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                    stop.active ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {stop.orderNumber}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {stop.name}
                    </h4>
                    {stop.operationalNote && (
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        {stop.operationalNote}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setEditingStop(stop)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar nombre u observaciones"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {/* Enrolled Students Badge */}
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Estudiantes: <strong className="text-slate-900 font-mono">{stop.studentCount || 0}</strong>
                  </span>
                </div>

                {/* Active Toggle */}
                <button
                  onClick={() => handleToggleActive(stop)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                    stop.active
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={stop.active ? 'Desactivar paradero' : 'Activar paradero'}
                >
                  {stop.active ? 'Habilitado' : 'Desactivado'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Stop Modal */}
      {editingStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Editar Paradero #{editingStop.orderNumber}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Oficial del Paradero</label>
                <input
                  type="text"
                  value={editingStop.name}
                  onChange={(e) => setEditingStop({ ...editingStop, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nota Operativa o Sector (Opcional)</label>
                <input
                  type="text"
                  value={editingStop.operationalNote || ''}
                  onChange={(e) => setEditingStop({ ...editingStop, operationalNote: e.target.value })}
                  placeholder="Ej. Sector Alto, Ruta 2, etc."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingStop(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Stop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Adicionar Nuevo Paradero Oficial
            </h3>

            <form onSubmit={handleCreateStop} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Paradero *</label>
                <input
                  type="text"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder="Ej. Entrada Vereda San Jerónimo"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nota Operativa o Sector (Opcional)</label>
                <input
                  type="text"
                  value={newStopNote}
                  onChange={(e) => setNewStopNote(e.target.value)}
                  placeholder="Ej. Kilómetro 4 vía Duitama"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                >
                  {actionLoading ? 'Registrando...' : 'Crear Paradero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
