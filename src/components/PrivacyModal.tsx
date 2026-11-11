import React from "react";
import { X, ShieldCheck, Scale, FileText, CheckCircle2 } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Política de Tratamiento y Protección de Datos Personales
              </h3>
              <p className="text-xs text-blue-200">
                Alcaldía Municipal de Nobsa, Boyacá · Ley 1581 de 2012
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-900 text-xs">
            <Scale className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">
                Marco Legal Colombiano
              </span>
              En cumplimiento del Artículo 15 de la Constitución Política de
              Colombia, la Ley Estatutaria 1581 de 2012 y el Decreto
              Reglamentario 1377 de 2013, la Alcaldía Municipal de Nobsa adopta
              las directrices de recolección y tratamiento de datos de niños,
              niñas y adolescentes.
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              1. Finalidad Exclusiva de la Recolección
            </h4>
            <p className="text-xs text-slate-600">
              La información suministrada por los acudientes y estudiantes a
              través de esta plataforma digital se destina exclusivamente a:
            </p>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-600 pl-2">
              <li>
                Planificar la cobertura de rutas, paraderos y cupos del Programa
                de Transporte Escolar para la vigencia 2027.
              </li>
              <li>
                Verificar la vinculación activa y sede oficial en las
                Instituciones Educativas del municipio de Nobsa.
              </li>
              <li>
                Cruzar criterios de priorización conforme a la clasificación del
                SISBÉN y vulnerabilidad socioeconómica.
              </li>
              <li>
                Establecer canales directos y verificables de comunicación con
                los padres y acudientes autorizados.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              2. Derechos del Titular (Habeas Data)
            </h4>
            <p className="text-xs text-slate-600">
              Como titular de los datos personales o representante legal del
              menor de edad, usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs text-slate-600 pl-2">
              <li>
                Conocer, actualizar y rectificar los datos personales
                suministrados.
              </li>
              <li>
                Ser informado sobre el uso y las medidas de seguridad aplicadas
                a su información.
              </li>
             
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              3. Protección Especial a Menores de Edad
            </h4>
            <p className="text-xs text-slate-600">
              El tratamiento de los datos de niños, niñas y adolescentes
              responderá y respetará el interés superior de los mismos y
              asegurará el respeto de sus derechos fundamentales, garantizando
              que bajo ninguna circunstancia serán transferidos ni divulgados a
              terceros sin orden legal.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500">
            <strong>Responsable del Tratamiento:</strong> Alcaldía Municipal de
            Nobsa, Boyacá ·NIT: 891.801.109-1 · DIRECCIÓN: Parque
            Principal Nobsa · Correo: gestionsocial@nobsa-boyaca.gov.co
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Vigencia contractual 2027
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aceptar Autorización
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
