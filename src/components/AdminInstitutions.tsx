import React, { useEffect, useState } from 'react';
import { School, Plus, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { EducationalInstitution } from '../types';

interface AdminInstitutionsProps {
  token: string;
  onRefreshInstitutions: () => void;
}

export const AdminInstitutions: React.FC<AdminInstitutionsProps> = ({ token, onRefreshInstitutions }) => {
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('Institución Educativa Técnica de Nobsa');
  const [sede, setSede] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [token]);

  const handleToggle = async (inst: EducationalInstitution) => {
    try {
      const res = await fetch(`/api/admin/institutions/${inst.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !inst.active }),
      });
      if (res.ok) {
        fetchInstitutions();
        onRefreshInstitutions();
      }
    } catch (e) {
      alert('Error al modificar estado');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sede.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), sede: sede.trim() }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSede('');
        fetchInstitutions();
        onRefreshInstitutions();
      }
    } catch (e) {
      alert('Error al agregar sede');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Planteles Educativos Oficiales
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Gestión de Instituciones y Sedes Educativas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegios públicos beneficiarios del transporte escolar en el Municipio de Nobsa
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Sede
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Cargando instituciones...
          </div>
        ) : (
          institutions.map((inst) => (
            <div
              key={inst.id}
              className={`p-5 rounded-2xl border transition-all ${
                inst.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {inst.name}
                  </h4>
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {inst.sede}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Estado en formulario:
                </span>
                <button
                  onClick={() => handleToggle(inst)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    inst.active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {inst.active ? 'Habilitada' : 'Inactiva'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              Adicionar Sede o Institución Educativa
            </h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Institución *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sede *</label>
                <input
                  type="text"
                  value={sede}
                  onChange={(e) => setSede(e.target.value)}
                  placeholder="Ej. Sede Bellavista, Sede Rural San Antonio..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                >
                  {saving ? 'Guardando...' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
