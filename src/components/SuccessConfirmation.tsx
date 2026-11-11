import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  User, 
  School, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  FileText,
  ShieldCheck,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Inscription } from '../types';
import { generateInscriptionPDF } from '../utils/pdfGenerator';
import { NobsaLogo } from './NobsaLogo';

interface SuccessConfirmationProps {
  inscription: Inscription;
  onNewInscription: () => void;
}

export const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  inscription,
  onNewInscription,
}) => {
  const [copied, setCopied] = useState(false);
  const student = inscription.student;
  const guardian = inscription.guardian;

  useEffect(() => {
    // Fire celebratory confetti for successful registration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#024794', '#059669', '#fbbf24', '#ffffff'],
      });
    } catch (e) {
      // Ignore if canvas is unavailable
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inscription.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    generateInscriptionPDF(inscription);
  };

  const formattedDate = new Date(inscription.createdAt).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Institutional Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-900 text-white p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle background seal */}
          <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
            <NobsaLogo className="w-64 h-64" variant="shield" />
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-emerald-600 shadow-xl mb-4 ring-8 ring-white/20">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
            ¡Inscripción registrada exitosamente!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-lg mx-auto">
            El registro para el Programa de Transporte Escolar – Vigencia 2027 ha sido radicado oficialmente ante la Alcaldía Municipal de Nobsa.
          </p>

          {/* Unique Code Pill */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
              Código Único de Radicado:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-mono font-black text-amber-300 tracking-wider">
                {inscription.id}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copiar código al portapapeles"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-300 font-medium mt-1">
              ¡Código copiado al portapapeles!
            </p>
          )}
        </div>

        {/* Certificate Details Summary Card */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Resumen de Información Registrada
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Vigencia 2027
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Nombre del estudiante:</span>
                <span className="font-bold text-slate-900 text-sm">{student?.fullName}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Documento de identidad:</span>
                <span className="font-bold text-slate-800">
                  {student?.documentType}: {student?.documentNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Institución educativa:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <School className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  {student?.institution}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Grado escolar 2027:</span>
                <span className="font-bold text-slate-800">{student?.grade}</span>
              </div>

              <div className="sm:col-span-2 bg-blue-50/80 p-3.5 rounded-xl border border-blue-200">
                <span className="text-blue-700 font-bold block mb-0.5">
                  Paradero seleccionado donde aborda el transporte:
                </span>
                <span className="font-extrabold text-blue-950 text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  {student?.busStopName}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Acudiente responsable:</span>
                <span className="font-semibold text-slate-800">{guardian?.fullName}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Teléfono / Celular de contacto:</span>
                <span className="font-semibold text-slate-800">{guardian?.phone}</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha y hora oficial de radicación: {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-bold text-sm shadow-xl shadow-blue-700/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" />
              Descargar Comprobante en PDF
            </button>

            <button
              type="button"
              onClick={onNewInscription}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Inscribir otro estudiante
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};
