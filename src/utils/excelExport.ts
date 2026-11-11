import * as XLSX from 'xlsx';
import { Inscription } from '../types';

export function exportInscriptionsToExcel(inscriptions: Inscription[], filenamePrefix = 'Inscripciones_Transporte_Nobsa_2027') {
  const data = inscriptions.map((insc, index) => {
    if (insc.status === 'NO_CONTINUA') {
      return {
        'No.': index + 1,
        'Código Radicado': insc.id,
        'Estado Continuidad': 'NO DESEA CONTINUAR',
        'Nombres y Apellidos Estudiante': insc.declinationDetails?.studentFullName || 'No especificado',
        'Tipo Documento': 'N/A',
        'Número Documento Estudiante': insc.declinationDetails?.documentNumber || 'No especificado',
        'Institución Educativa': insc.declinationDetails?.school || 'N/A',
        'Grado': 'N/A',
        'Tiene SISBÉN Estudiante': 'N/A',
        'Nivel SISBÉN Estudiante': 'N/A',
        'Municipio SISBÉN Estudiante': 'N/A',
        'Paradero Seleccionado': 'N/A',
        'Nombres y Apellidos Acudiente': 'N/A',
        'Tipo Documento Acudiente': 'N/A',
        'Número Documento Acudiente': 'N/A',
        'Tiene SISBÉN Acudiente': 'N/A',
        'Nivel SISBÉN Acudiente': 'N/A',
        'Municipio SISBÉN Acudiente': 'N/A',
        'Teléfono Acudiente': 'N/A',
        'Correo Acudiente': 'N/A',
        'Motivo / Observaciones': insc.declinationDetails?.reason || '',
        'Fecha Radicación': new Date(insc.createdAt).toLocaleString('es-CO'),
      };
    }

    const st = insc.student;
    const gd = insc.guardian;

    return {
      'No.': index + 1,
      'Código Radicado': insc.id,
      'Estado Continuidad': 'CONTINÚA EN 2027',
      'Nombres y Apellidos Estudiante': st?.fullName || '',
      'Tipo Documento': st?.documentType === 'Otro' ? `Otro (${st.documentTypeOther})` : (st?.documentType || ''),
      'Número Documento Estudiante': st?.documentNumber || '',
      'Institución Educativa': st?.institution || '',
      'Grado': st?.grade || '',
      'Tiene SISBÉN Estudiante': st?.hasSisben ? 'SÍ' : 'NO',
      'Nivel SISBÉN Estudiante': st?.sisbenLevel || '',
      'Municipio SISBÉN Estudiante': st?.sisbenMunicipality || '',
      'Paradero Seleccionado': st?.busStopName || '',
      'Nombres y Apellidos Acudiente': gd?.fullName || '',
      'Tipo Documento Acudiente': gd?.documentType === 'Otro' ? `Otro (${gd.documentTypeOther})` : (gd?.documentType || ''),
      'Número Documento Acudiente': gd?.documentNumber || '',
      'Tiene SISBÉN Acudiente': gd?.hasSisben ? 'SÍ' : 'NO',
      'Nivel SISBÉN Acudiente': gd?.sisbenLevel || '',
      'Municipio SISBÉN Acudiente': gd?.sisbenMunicipality || '',
      'Teléfono Acudiente': gd?.phone || '',
      'Correo Acudiente': gd?.email || '',
      'Motivo / Observaciones': insc.notes || '',
      'Fecha Radicación': new Date(insc.createdAt).toLocaleString('es-CO'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // No.
    { wch: 22 }, // Código
    { wch: 18 }, // Estado
    { wch: 32 }, // Estudiante
    { wch: 20 }, // Tipo doc
    { wch: 18 }, // Doc num
    { wch: 38 }, // Institución
    { wch: 22 }, // Grado
    { wch: 12 }, // Sisben?
    { wch: 14 }, // Nivel Sisben
    { wch: 18 }, // Mun Sisben
    { wch: 30 }, // Paradero
    { wch: 30 }, // Acudiente
    { wch: 18 }, // Tipo doc acudiente
    { wch: 18 }, // Doc acudiente
    { wch: 12 }, // Sisben acudiente
    { wch: 14 }, // Nivel sisben acudiente
    { wch: 18 }, // Mun acudiente
    { wch: 16 }, // Tel
    { wch: 28 }, // Correo
    { wch: 30 }, // Observaciones
    { wch: 20 }, // Fecha
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscripciones 2027');
  const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
