import * as XLSX from 'xlsx-js-style';
import { Inscription } from '../types';
import { getTransportDestinations } from '../data/transportRoutes';

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
        'Vereda': 'N/A',
        'Destino': 'N/A',
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
      'Vereda': st?.vereda || '',
      'Destino': st?.vereda
        ? (getTransportDestinations(st.vereda, st.grade).length === 1
            ? getTransportDestinations(st.vereda, st.grade)[0]
            : 'Selección registrada por el acudiente')
        : '',
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

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const institutionalRed = 'B91C2C';
  const institutionalDark = '1F1F1F';
  const institutionalGray = 'E5E7EB';
  const institutionalLightGray = 'F3F4F6';
  const white = 'FFFFFF';

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[address]) continue;

      worksheet[address].s = row === 0
        ? {
            fill: { patternType: 'solid', fgColor: { rgb: institutionalRed } },
            font: { bold: true, color: { rgb: white }, sz: 11 },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: institutionalDark } },
              bottom: { style: 'thin', color: { rgb: institutionalDark } },
              left: { style: 'thin', color: { rgb: institutionalDark } },
              right: { style: 'thin', color: { rgb: institutionalDark } },
            },
          }
        : {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: row % 2 === 0 ? institutionalLightGray : white },
            },
            font: {
              bold: col === 0 || col === 1 || col === 2,
              color: { rgb: institutionalDark },
              sz: 10,
            },
            alignment: { vertical: 'top', wrapText: true },
            border: {
              top: { style: 'hair', color: { rgb: institutionalGray } },
              bottom: { style: 'hair', color: { rgb: institutionalGray } },
              left: { style: 'hair', color: { rgb: institutionalGray } },
              right: { style: 'hair', color: { rgb: institutionalGray } },
            },
          };
    }
  }

  worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1:X1' };
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };
  worksheet['!rows'] = [{ hpt: 32, hpx: 32 }];

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
    { wch: 30 }, // Vereda
    { wch: 32 }, // Destino
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
