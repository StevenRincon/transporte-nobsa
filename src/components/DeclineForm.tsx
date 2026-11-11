import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Send, School } from 'lucide-react';
import { EducationalInstitution } from '../types';

interface DeclineFormProps {
  institutions: EducationalInstitution[];
  onBack: () => void;
  onSuccess: (data: any) => void;
}

export const DeclineForm: React.FC<DeclineFormProps> = ({ institutions, onBack, onSuccess }) => {
  const [studentFullName, setStudentFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [school, setSchool] = useState('');
  const [reason, setReason] = useState('Decisión familiar voluntaria');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'NO_CONTINUA',
          declinationDetails: {
            studentFullName: studentFullName.trim() || 'Estudiante no especificado',
            documentNumber: documentNumber.trim() || 'Sin documento',
            school: school || 'No especificada',
            reason: reason || 'Decisión voluntaria',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar la decisión.');
      }

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la selección inicial
          </button>
          <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans']">
            Constancia de No Continuidad – Vigencia 2027
          </h2>
         
        </div>

        {/* Informative Callout */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1 text-amber-950">
                Finalización sin solicitud de datos personales adicionales
              </p>
              <p>
                Al indicar que el estudiante no continuará con el servicio de transporte escolar para la vigencia 2027, la Alcaldía no requiere solicitar sus datos personales completos. Agradecemos diligenciar este registro mínimo para actualizar el censo escolar del municipio.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres y Apellidos del Estudiante (Opcional)
              </label>
              <input
                type="text"
                value={studentFullName}
                onChange={(e) => setStudentFullName(e.target.value)}
                placeholder="Ej. Juan Andrés Martínez López"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Documento (Opcional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 1057894321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institución Educativa (Opcional)
                </label>
                <div className="relative">
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all bg-white text-slate-700 appearance-none"
                  >
                    <option value="">Seleccione si aplica...</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.fullName}>
                        {inst.fullName}
                      </option>
                    ))}
                  </select>
                  <School className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivo principal de no continuidad
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all bg-white text-slate-700"
              >
                <option value="Decisión familiar voluntaria">Decisión familiar voluntaria</option>
                <option value="Cambio de municipio o residencia">Cambio de municipio o residencia</option>
                <option value="Traslado a colegio privado o de otro municipio">Traslado a colegio privado o de otro municipio</option>
                <option value="Cuenta con medio de transporte propio o familiar">Cuenta con medio de transporte propio o familiar</option>
                <option value="Graduación o culminación de estudios de bachillerato">Graduación o culminación de estudios de bachillerato</option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar y regresar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Confirmar y Finalizar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
