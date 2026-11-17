import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inscription } from '../types';
import { getTransportDestinations } from '../data/transportRoutes';

export function generateInscriptionPDF(inscription: Inscription) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const student = inscription.student;
  const guardian = inscription.guardian;
  const calculatedDestinations = student?.vereda
    ? getTransportDestinations(student.vereda, student.grade)
    : [];
  const calculatedDestination = calculatedDestinations.length === 1
    ? calculatedDestinations[0]
    : 'Selección registrada por el acudiente';

  // Header Background Institutional Banner
  doc.setFillColor(185, 28, 28); // Rojo institucional
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Institutional Accent Bars
  doc.setFillColor(31, 31, 31); // Negro institucional
  doc.rect(0, 28, pageWidth, 2, 'F');
  doc.setFillColor(229, 231, 235); // Gris institucional
  doc.rect(0, 30, pageWidth, 1.5, 'F');

  // Header Texts
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ALCALDÍA MUNICIPAL DE NOBSA – BOYACÁ', pageWidth / 2, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('SECRETARÍA DE LA MUJER Y PROGRAMAS SOCIALES', pageWidth / 2, 17, { align: 'center' });
  doc.setFontSize(8);
  doc.text('PROGRAMA DE TRANSPORTE ESCOLAR RURAL Y URBANO – VIGENCIA 2027', pageWidth / 2, 23, { align: 'center' });

  // Main Document Box
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('COMPROBANTE OFICIAL DE INSCRIPCIÓN', pageWidth / 2, 42, { align: 'center' });

  // Code & Date Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 47, pageWidth - 28, 18, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('CÓDIGO DE INSCRIPCIÓN:', 20, 54);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(inscription.id, 20, 60);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('FECHA Y HORA DE REGISTRO:', pageWidth - 80, 54);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const formattedDate = new Date(inscription.createdAt).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  doc.text(formattedDate, pageWidth - 80, 60);

  let currentY = 70;

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(185, 28, 28);
  doc.roundedRect(14, currentY, pageWidth - 28, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28);
  doc.text('DEBE IMPRIMIR ESTE DOCUMENTO', pageWidth / 2, currentY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(31, 31, 31);
  doc.text(
    'Radíquelo en la oficina de la Secretaría de la Mujer y Programas Sociales,',
    pageWidth / 2,
    currentY + 12,
    { align: 'center' },
  );
  doc.text('frente al cementerio del municipio de Nobsa.', pageWidth / 2, currentY + 16, { align: 'center' });

  currentY += 23;

  // Student Section Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 31, 31);
  doc.text('1. INFORMACIÓN DEL ESTUDIANTE', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Campo', 'Información Registrada']],
    body: [
      ['Nombres y Apellidos:', student?.fullName || 'N/A'],
      ['Tipo de Documento:', student?.documentType === 'Otro' ? `Otro (${student.documentTypeOther})` : (student?.documentType || 'N/A')],
      ['Número de Documento:', student?.documentNumber || 'N/A'],
      ['Institución Educativa:', student?.institution || 'N/A'],
      ['Grado a Cursar 2027:', student?.grade || 'N/A'],
      ['Vereda:', student?.vereda || 'N/A'],
      ['Clasificación SISBÉN:', student?.hasSisben ? `SÍ (Nivel: ${student.sisbenLevel || 'N/A'} - Municipio: ${student.sisbenMunicipality || 'N/A'})` : 'NO'],
      ['Paradero de Transporte Asignado:', student?.busStopName || 'N/A'],
      ['Destino de la Ruta:', calculatedDestination],
    ],
    theme: 'grid',
    headStyles: { fillColor: [185, 28, 28], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 7.5, textColor: [31, 31, 31], minCellHeight: 5 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Guardian Section Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 31, 31);
  doc.text('2. INFORMACIÓN DEL ACUDIENTE / RESPONSABLE', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Campo', 'Información Registrada']],
    body: [
      ['Nombres y Apellidos del Acudiente:', guardian?.fullName || 'N/A'],
      ['Tipo y Número de Documento:', `${guardian?.documentType || 'N/A'}: ${guardian?.documentNumber || 'N/A'}`],
      ['Clasificación SISBÉN Acudiente:', guardian?.hasSisben ? `SÍ (Nivel: ${guardian.sisbenLevel || 'N/A'} - Municipio: ${guardian.sisbenMunicipality || 'N/A'})` : 'NO'],
      ['Teléfono Móvil de Contacto:', guardian?.phone || 'N/A'],
      ['Correo Electrónico:', guardian?.email || 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [31, 31, 31], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 7.5, textColor: [31, 31, 31], minCellHeight: 5 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Legal and Habeas Data statement box
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(185, 28, 28);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TRATAMIENTO DE DATOS PERSONALES – LEY 1581 DE 2012:', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalText = "El acudiente autorizó a la Alcaldía Municipal de Nobsa para recolectar y tratar los datos suministrados con el fin de identificar a los estudiantes interesados en continuar con el servicio de transporte escolar 2027, garantizando confidencialidad y reserva conforme a la ley. Este documento es un comprobante formal de radicación de solicitud de continuidad.";
  const splitLegal = doc.splitTextToSize(legalText, pageWidth - 36);
  doc.text(splitLegal, 18, currentY + 11);

  // Digital Signatures / Seals Box
  const signatureY = 238;

  doc.setDrawColor(148, 163, 184);
  doc.line(24, signatureY + 18, 90, signatureY + 18);
  doc.line(pageWidth - 90, signatureY + 18, pageWidth - 24, signatureY + 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('SECRETARÍA DE LA MUJER Y PROGRAMAS SOCIALES', 57, signatureY + 23, { align: 'center' });
  doc.text('FIRMA DEL ACUDIENTE', pageWidth - 57, signatureY + 23, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Alcaldía Municipal de Nobsa', 57, signatureY + 27, { align: 'center' });
  const guardianName = doc.splitTextToSize(guardian?.fullName || 'Acudiente', 66);
  doc.text(guardianName, pageWidth - 57, signatureY + 27, { align: 'center' });
  doc.text(`C.C. ${guardian?.documentNumber || '________________'}`, pageWidth - 57, signatureY + 31, { align: 'center' });

  // Footer bar
  doc.setFillColor(31, 31, 31);
  doc.rect(0, 285, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Palacio Municipal de Nobsa - Parque Principal · gestionsocial@nobsa-boyaca.gov.co', pageWidth / 2, 292, { align: 'center' });

  // Save the PDF
  const filename = `Comprobante_Transporte_2027_${student?.documentNumber || 'Nobsa'}.pdf`;
  doc.save(filename);
}

export function generateMasterReportPDF(inscriptions: Inscription[], filterDescription?: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(185, 28, 28);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ALCALDÍA MUNICIPAL DE NOBSA – REPORTE DE INSCRIPCIONES TRANSPORTE ESCOLAR 2027', pageWidth / 2, 9, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleString('es-CO')} | Registros en este reporte: ${inscriptions.length} ${filterDescription ? `| Filtro: ${filterDescription}` : ''}`, pageWidth / 2, 16, { align: 'center' });

  const rows = inscriptions.map((insc, idx) => {
    if (insc.status === 'NO_CONTINUA') {
      return [
        (idx + 1).toString(),
        insc.id,
        insc.declinationDetails?.studentFullName || 'N/A',
        insc.declinationDetails?.documentNumber || 'N/A',
        insc.declinationDetails?.school || 'N/A',
        'NO CONTINÚA',
        'Motivo: ' + (insc.declinationDetails?.reason || 'No especificado'),
        'N/A',
        'N/A',
        new Date(insc.createdAt).toLocaleDateString('es-CO'),
      ];
    }
    return [
      (idx + 1).toString(),
      insc.id,
      insc.student?.fullName || '',
      `${insc.student?.documentType?.substring(0, 4) || ''}. ${insc.student?.documentNumber || ''}`,
      insc.student?.institution || '',
      insc.student?.grade || '',
      insc.student?.busStopName || '',
      insc.guardian?.fullName || '',
      insc.guardian?.phone || '',
      new Date(insc.createdAt).toLocaleDateString('es-CO'),
    ];
  });

  autoTable(doc, {
    startY: 26,
    head: [['#', 'Código', 'Estudiante', 'Doc. Identidad', 'Institución', 'Grado', 'Paradero', 'Acudiente', 'Teléfono', 'Fecha']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [31, 31, 31], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [31, 31, 31] },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { cellWidth: 42 },
      3: { cellWidth: 26 },
      4: { cellWidth: 48 },
      5: { cellWidth: 26 },
      6: { cellWidth: 36 },
      7: { cellWidth: 34 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 },
    },
    margin: { left: 8, right: 8 },
  });

  doc.save(`Reporte_Transporte_Escolar_Nobsa_2027_${Date.now()}.pdf`);
}
