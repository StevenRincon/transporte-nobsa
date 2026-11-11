import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inscription } from '../types';

export function generateInscriptionPDF(inscription: Inscription) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const student = inscription.student;
  const guardian = inscription.guardian;

  // Header Background Institutional Banner
  doc.setFillColor(2, 71, 148); // #024794 Nobsa Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Colombian Accent Bar (Yellow, Blue, Red)
  doc.setFillColor(251, 191, 36); // Yellow
  doc.rect(0, 28, pageWidth, 2, 'F');
  doc.setFillColor(5, 150, 105); // Boyacá Green
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
  doc.setTextColor(2, 71, 148);
  doc.text('CÓDIGO DE INSCRIPCIÓN:', 20, 54);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(inscription.id, 20, 60);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 71, 148);
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

  let currentY = 72;

  // Student Section Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 71, 148);
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
      ['Clasificación SISBÉN:', student?.hasSisben ? `SÍ (Nivel: ${student.sisbenLevel || 'N/A'} - Municipio: ${student.sisbenMunicipality || 'N/A'})` : 'NO'],
      ['Paradero de Transporte Asignado:', student?.busStopName || 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [2, 71, 148], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Guardian Section Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 71, 148);
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
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Legal and Habeas Data statement box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TRATAMIENTO DE DATOS PERSONALES – LEY 1581 DE 2012:', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalText = "El acudiente autorizó a la Alcaldía Municipal de Nobsa para recolectar y tratar los datos suministrados con el fin de identificar a los estudiantes interesados en continuar con el servicio de transporte escolar 2027, garantizando confidencialidad y reserva conforme a la ley. Este documento es un comprobante formal de radicación de solicitud de continuidad.";
  const splitLegal = doc.splitTextToSize(legalText, pageWidth - 36);
  doc.text(splitLegal, 18, currentY + 12);

  // Digital Signatures / Seals Box
  currentY += 34;

  doc.setDrawColor(148, 163, 184);
  doc.line(24, currentY + 18, 90, currentY + 18);
  doc.line(pageWidth - 90, currentY + 18, pageWidth - 24, currentY + 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('SECRETARÍA DE LA MUJER Y PROGRAMAS SOCIALES', 57, currentY + 23, { align: 'center' });
  doc.text('FIRMA DEL ACUDIENTE', pageWidth - 57, currentY + 23, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Alcaldía Municipal de Nobsa', 57, currentY + 27, { align: 'center' });
  doc.text(`C.C. ${guardian?.documentNumber || '________________'}`, pageWidth - 57, currentY + 27, { align: 'center' });

  // Footer bar
  doc.setFillColor(2, 71, 148);
  doc.rect(0, 285, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Palacio Municipal de Nobsa – Carrera 5 No. 5-30, Parque Principal · Cel: (57) 310 000 0000 · contacto@nobsa-boyaca.gov.co', pageWidth / 2, 292, { align: 'center' });

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
  doc.setFillColor(2, 71, 148);
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
    headStyles: { fillColor: [2, 71, 148], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
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
