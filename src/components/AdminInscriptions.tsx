import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  School, 
  MapPin, 
  User, 
  Users, 
  Phone, 
  Mail, 
  Clock, 
  X,
  History,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Inscription, EducationalInstitution, BusStop } from '../types';
import { exportInscriptionsToExcel } from '../utils/excelExport';
import { generateMasterReportPDF, generateInscriptionPDF } from '../utils/pdfGenerator';

interface AdminInscriptionsProps {
  token: string;
  institutions: EducationalInstitution[];
  busStops: BusStop[];
  initialFilter?: { institution?: string; status?: string };
}

export const AdminInscriptions: React.FC<AdminInscriptionsProps> = ({
  token,
  institutions,
  busStops,
  initialFilter,
}) => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(initialFilter?.institution || '');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBusStopId, setSelectedBusStopId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialFilter?.status || 'ALL');

  // Modal states
  const [viewingInscription, setViewingInscription] = useState<Inscription | null>(null);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Fetch inscriptions
  const fetchInscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedInstitution) params.append('institution', selectedInstitution);
      if (selectedGrade) params.append('grade', selectedGrade);
      if (selectedBusStopId) params.append('busStopId', selectedBusStopId);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/admin/inscriptions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar inscripciones');
      const data = await res.json();
      setInscriptions(data.inscriptions);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptions();
  }, [searchTerm, selectedInstitution, selectedGrade, selectedBusStopId, selectedStatus]);

  // Open details modal
  const handleOpenDetails = async (insc: Inscription) => {
    setViewingInscription(insc);
    try {
      const res = await fetch(`/api/admin/inscriptions/${insc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data.history || []);
      }
    } catch (e) {
      setHistoryLogs([]);
    }
  };

  // Open edit modal
  const handleOpenEdit = (insc: Inscription) => {
    setEditingInscription(JSON.parse(JSON.stringify(insc)));
    setEditSuccessMsg(null);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingInscription) return;
    setSavingEdit(true);
    try {
      const selectedStop = busStops.find(b => b.id === editingInscription.student?.busStopId);
      const payload = {
        student: {
          ...editingInscription.student,
          busStopName: selectedStop?.name || editingInscription.student?.busStopName,
        },
        guardian: editingInscription.guardian,
        notes: editingInscription.notes,
      };

      const res = await fetch(`/api/admin/inscriptions/${editingInscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo guardar la modificación');
      }

      setEditSuccessMsg('Registro actualizado exitosamente.');
      setTimeout(() => {
        setEditingInscription(null);
        fetchInscriptions();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar');
    } finally {
      setSavingEdit(false);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    exportInscriptionsToExcel(inscriptions, 'Inscripciones_Transporte_Nobsa_2027');
  };

  const handleExportPDF = () => {
    let filterNote = '';
    if (selectedInstitution) filterNote += `Inst: ${selectedInstitution} `;
    if (selectedStatus !== 'ALL') filterNote += `Estado: ${selectedStatus} `;
    generateMasterReportPDF(inscriptions, filterNote);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedInstitution('');
    setSelectedGrade('');
    setSelectedBusStopId('');
    setSelectedStatus('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Gestión Centralizada de Inscripciones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta, auditoría, exportación y modificación de beneficiarios 2027
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            title="Descargar hoja de cálculo Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar a Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            title="Descargar reporte en formato PDF"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Imprimir listado en pantalla"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, documento o código de radicado..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none bg-white font-medium"
            >
              <option value="ALL">Todos los Estados (Continuidad)</option>
              <option value="CONTINUA">Continúan en 2027 (Beneficiarios)</option>
              <option value="NO_CONTINUA">No continúan en 2027</option>
            </select>
          </div>

          {/* Institution Filter */}
          <div>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none bg-white font-medium"
            >
              <option value="">Todas las Instituciones</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.fullName}>
                  {i.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 items-center">
          <div>
            <select
              value={selectedBusStopId}
              onChange={(e) => setSelectedBusStopId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none bg-white"
            >
              <option value="">Todos los Paraderos (44 disponibles)</option>
              {busStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.orderNumber}. {stop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Total resultados:</span>
            <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
              {inscriptions.length}
            </span>
          </div>

          <div className="text-right">
            {(searchTerm || selectedInstitution || selectedGrade || selectedBusStopId || selectedStatus !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
              >
                Restablecer todos los filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Estudiante</th>
                <th className="py-3 px-3">Doc. Identidad</th>
                <th className="py-3 px-3">Institución Educativa</th>
                <th className="py-3 px-3">Grado</th>
                <th className="py-3 px-3">Paradero Asignado</th>
                <th className="py-3 px-3">Acudiente</th>
                <th className="py-3 px-3">Contacto</th>
                <th className="py-3 px-3">Fecha Radicación</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Cargando información...
                  </td>
                </tr>
              ) : inscriptions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron inscripciones con los filtros especificados.
                  </td>
                </tr>
              ) : (
                inscriptions.map((insc) => {
                  const isDecline = insc.status === 'NO_CONTINUA';

                  if (isDecline) {
                    return (
                      <tr key={insc.id} className="bg-slate-50/70 hover:bg-slate-100/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600">
                          {insc.id}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-700">
                          {insc.declinationDetails?.studentFullName || 'Estudiante'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {insc.declinationDetails?.documentNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {insc.declinationDetails?.school || 'N/A'}
                        </td>
                        <td colSpan={2} className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <XCircle className="w-3 h-3 text-amber-600" />
                            No desea continuar 2027
                          </span>
                        </td>
                        <td colSpan={2} className="py-3 px-3 text-slate-500 text-[11px] italic">
                          Motivo: {insc.declinationDetails?.reason || 'Decisión voluntaria'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(insc.createdAt).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenDetails(insc)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const st = insc.student;
                  const gd = insc.guardian;

                  return (
                    <tr key={insc.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {insc.id}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {st?.fullName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                        <span className="text-[10px] uppercase text-slate-400 block">
                          {st?.documentType === 'Otro' ? st.documentTypeOther : st?.documentType}
                        </span>
                        {st?.documentNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-800 max-w-[200px] truncate" title={st?.institution}>
                        {st?.institution}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {st?.grade}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="truncate max-w-[150px]" title={st?.busStopName}>
                            {st?.busStopName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 whitespace-nowrap font-medium">
                        {gd?.fullName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{gd?.phone}</div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[120px]" title={gd?.email}>
                          {gd?.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(insc.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetails(insc)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(insc)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar registro"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => generateInscriptionPDF(insc)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Descargar comprobante PDF oficial"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: DETALLES COMPLETOS & AUDITORÍA ================= */}
      {viewingInscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Expediente de Radicación Oficial 2027
                </span>
                <h3 className="text-base font-extrabold font-mono text-white">
                  {viewingInscription.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingInscription(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {viewingInscription.status === 'NO_CONTINUA' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm">Registro de No Continuidad</h4>
                  <p><strong>Estudiante:</strong> {viewingInscription.declinationDetails?.studentFullName}</p>
                  <p><strong>Documento:</strong> {viewingInscription.declinationDetails?.documentNumber}</p>
                  <p><strong>Institución:</strong> {viewingInscription.declinationDetails?.school}</p>
                  <p><strong>Motivo declarado:</strong> {viewingInscription.declinationDetails?.reason}</p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Registrado el: {new Date(viewingInscription.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
              ) : (
                <>
                  {/* Estudiante card */}
                  <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200 space-y-2">
                    <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5 border-b border-blue-200/80 pb-1.5">
                      <User className="w-4 h-4 text-blue-700" />
                      1. Información del Estudiante
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-500 font-medium block">Nombres y Apellidos:</span>
                        <span className="font-bold text-slate-900">{viewingInscription.student?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Tipo y Documento:</span>
                        <span className="font-semibold text-slate-800">
                          {viewingInscription.student?.documentType}: {viewingInscription.student?.documentNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Institución:</span>
                        <span className="font-semibold text-slate-800">{viewingInscription.student?.institution}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Grado 2027:</span>
                        <span className="font-semibold text-slate-800">{viewingInscription.student?.grade}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 font-medium block">Clasificación SISBÉN:</span>
                        <span className="font-semibold text-slate-800">
                          {viewingInscription.student?.hasSisben 
                            ? `SÍ (Nivel ${viewingInscription.student?.sisbenLevel} - Municipio: ${viewingInscription.student?.sisbenMunicipality})`
                            : 'NO TIENE CLASIFICACIÓN SISBÉN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Paradero card */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200">
                    <span className="text-amber-800 font-bold block text-xs mb-1">
                      Paradero donde aborda el transporte escolar:
                    </span>
                    <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-700" />
                      {viewingInscription.student?.busStopName}
                    </span>
                  </div>

                  {/* Acudiente card */}
                  <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5 border-b border-emerald-200/80 pb-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      2. Información del Acudiente
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-500 font-medium block">Nombres y Apellidos:</span>
                        <span className="font-bold text-slate-900">{viewingInscription.guardian?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Documento:</span>
                        <span className="font-semibold text-slate-800">
                          {viewingInscription.guardian?.documentType}: {viewingInscription.guardian?.documentNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Teléfono / Celular:</span>
                        <span className="font-semibold text-slate-800">{viewingInscription.guardian?.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Correo Electrónico:</span>
                        <span className="font-semibold text-slate-800">{viewingInscription.guardian?.email}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 font-medium block">Clasificación SISBÉN:</span>
                        <span className="font-semibold text-slate-800">
                          {viewingInscription.guardian?.hasSisben 
                            ? `SÍ (Nivel ${viewingInscription.guardian?.sisbenLevel} - Municipio: ${viewingInscription.guardian?.sisbenMunicipality})`
                            : 'NO TIENE CLASIFICACIÓN SISBÉN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal & Timestamp */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p><strong>Autorización Ley 1581 de 2012:</strong> Aceptada electrónicamente ({new Date(viewingInscription.authorization?.acceptedAt || viewingInscription.createdAt).toLocaleString('es-CO')})</p>
                    <p><strong>Fecha inicial de registro:</strong> {new Date(viewingInscription.createdAt).toLocaleString('es-CO')}</p>
                    {viewingInscription.updatedAt && (
                      <p className="text-amber-700 font-semibold">
                        Última modificación: {new Date(viewingInscription.updatedAt).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Audit history for this record */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Historial de Modificaciones y Trazabilidad (Auditoría)
                </h4>
                {historyLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No hay modificaciones registradas para este expediente.</p>
                ) : (
                  <div className="space-y-1.5">
                    {historyLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{log.userName}</span>
                          <span className="text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString('es-CO')}</span>
                        </div>
                        <div className="text-slate-600 mt-0.5">{log.details}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => generateInscriptionPDF(viewingInscription)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Descargar Comprobante PDF
              </button>

              <button
                onClick={() => setViewingInscription(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR INSCRIPCIÓN ================= */}
      {editingInscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block">
                  Edición Autorizada de Expediente
                </span>
                <h3 className="text-base font-extrabold font-mono text-white">
                  Modificar: {editingInscription.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingInscription(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {editSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {editSuccessMsg}
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  Cualquier modificación será registrada de forma inmutable en el registro de auditoría con su usuario y fecha.
                </span>
              </div>

              {/* Student fields */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nombre Completo del Estudiante</label>
                <input
                  type="text"
                  value={editingInscription.student?.fullName || ''}
                  onChange={(e) => setEditingInscription({
                    ...editingInscription,
                    student: { ...editingInscription.student!, fullName: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Institución Educativa</label>
                  <select
                    value={editingInscription.student?.institution || ''}
                    onChange={(e) => setEditingInscription({
                      ...editingInscription,
                      student: { ...editingInscription.student!, institution: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {institutions.map(i => (
                      <option key={i.id} value={i.fullName}>{i.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Grado Escolar</label>
                  <input
                    type="text"
                    value={editingInscription.student?.grade || ''}
                    onChange={(e) => setEditingInscription({
                      ...editingInscription,
                      student: { ...editingInscription.student!, grade: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Paradero Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Paradero de Abordaje (44 disponibles)
                </label>
                <select
                  value={editingInscription.student?.busStopId || ''}
                  onChange={(e) => setEditingInscription({
                    ...editingInscription,
                    student: { ...editingInscription.student!, busStopId: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium text-blue-900"
                >
                  {busStops.map(s => (
                    <option key={s.id} value={s.id}>{s.orderNumber}. {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Guardian fields */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Acudiente Responsable</label>
                  <input
                    type="text"
                    value={editingInscription.guardian?.fullName || ''}
                    onChange={(e) => setEditingInscription({
                      ...editingInscription,
                      guardian: { ...editingInscription.guardian!, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Teléfono Acudiente</label>
                  <input
                    type="text"
                    value={editingInscription.guardian?.phone || ''}
                    onChange={(e) => setEditingInscription({
                      ...editingInscription,
                      guardian: { ...editingInscription.guardian!, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingInscription.guardian?.email || ''}
                  onChange={(e) => setEditingInscription({
                    ...editingInscription,
                    guardian: { ...editingInscription.guardian!, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Notas Administrativas</label>
                <textarea
                  value={editingInscription.notes || ''}
                  onChange={(e) => setEditingInscription({
                    ...editingInscription,
                    notes: e.target.value
                  })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingInscription(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {savingEdit ? 'Guardando cambios...' : 'Guardar Modificación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
