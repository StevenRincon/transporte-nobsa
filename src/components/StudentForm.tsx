import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Users, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  ExternalLink,
  School,
  GraduationCap,
  Mail,
  Phone,
  CreditCard,
  Send
} from 'lucide-react';
import { BusStop, EducationalInstitution, DocumentType, Inscription } from '../types';
import { PrivacyModal } from './PrivacyModal';

interface StudentFormProps {
  busStops: BusStop[];
  institutions: EducationalInstitution[];
  grades: string[];
  authorizationText: string;
  onCancel: () => void;
  onSuccess: (inscription: Inscription) => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  busStops,
  institutions,
  grades,
  authorizationText,
  onCancel,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form State
  const [authAccepted, setAuthAccepted] = useState<boolean>(false);

  // Student State
  const [studentFullName, setStudentFullName] = useState<string>('');
  const [studentDocType, setStudentDocType] = useState<DocumentType>('Tarjeta de identidad');
  const [studentDocTypeOther, setStudentDocTypeOther] = useState<string>('');
  const [studentDocNum, setStudentDocNum] = useState<string>('');
  const [studentInstitution, setStudentInstitution] = useState<string>('');
  const [studentGrade, setStudentGrade] = useState<string>('');
  const [studentHasSisben, setStudentHasSisben] = useState<boolean>(false);
  const [studentSisbenLevel, setStudentSisbenLevel] = useState<string>('');
  const [studentSisbenMun, setStudentSisbenMun] = useState<string>('Nobsa');
  const [busStopId, setBusStopId] = useState<string>('');

  // Guardian State
  const [guardianFullName, setGuardianFullName] = useState<string>('');
  const [guardianDocType, setGuardianDocType] = useState<DocumentType>('Cédula de ciudadanía');
  const [guardianDocTypeOther, setGuardianDocTypeOther] = useState<string>('');
  const [guardianDocNum, setGuardianDocNum] = useState<string>('');
  const [guardianHasSisben, setGuardianHasSisben] = useState<boolean>(false);
  const [guardianSisbenLevel, setGuardianSisbenLevel] = useState<string>('');
  const [guardianSisbenMun, setGuardianSisbenMun] = useState<string>('Nobsa');
  const [guardianEmail, setGuardianEmail] = useState<string>('');
  const [guardianPhone, setGuardianPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!authAccepted) {
      errs.auth = 'Debe autorizar el tratamiento de datos personales para continuar.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!studentFullName.trim()) {
      errs.studentFullName = 'Ingrese los nombres y apellidos tal como aparecen en el documento.';
    } else if (studentFullName.trim().length < 5) {
      errs.studentFullName = 'Ingrese el nombre completo del estudiante.';
    }

    if (!studentDocType) {
      errs.studentDocType = 'Seleccione el tipo de documento.';
    }
    if (studentDocType === 'Otro' && !studentDocTypeOther.trim()) {
      errs.studentDocTypeOther = 'Especifique el tipo de documento del estudiante.';
    }

    if (!studentDocNum.trim()) {
      errs.studentDocNum = 'El número de documento de identidad es obligatorio.';
    }

    if (!studentInstitution) {
      errs.studentInstitution = 'Seleccione la institución educativa a la que pertenece.';
    }

    if (!studentGrade) {
      errs.studentGrade = 'Seleccione el grado a cursar en la vigencia 2027.';
    }

    if (studentHasSisben) {
      if (!studentSisbenLevel.trim()) {
        errs.studentSisbenLevel = 'Indique el nivel del SISBÉN (ej. A1, B2, C1).';
      }
      if (!studentSisbenMun.trim()) {
        errs.studentSisbenMun = 'Indique el municipio de expedición del SISBÉN.';
      }
    }

    if (!busStopId) {
      errs.busStopId = 'Seleccione el paradero donde el estudiante aborda el transporte.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!guardianFullName.trim()) {
      errs.guardianFullName = 'Ingrese los nombres y apellidos completos del acudiente.';
    }

    if (!guardianDocType) {
      errs.guardianDocType = 'Seleccione el tipo de documento del acudiente.';
    }
    if (guardianDocType === 'Otro' && !guardianDocTypeOther.trim()) {
      errs.guardianDocTypeOther = 'Especifique el tipo de documento del acudiente.';
    }

    if (!guardianDocNum.trim()) {
      errs.guardianDocNum = 'El número de documento del acudiente es obligatorio.';
    }

    if (guardianHasSisben) {
      if (!guardianSisbenLevel.trim()) {
        errs.guardianSisbenLevel = 'Indique el nivel del SISBÉN del acudiente.';
      }
      if (!guardianSisbenMun.trim()) {
        errs.guardianSisbenMun = 'Indique el municipio del SISBÉN del acudiente.';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guardianEmail.trim()) {
      errs.guardianEmail = 'El correo electrónico es obligatorio para recibir notificaciones.';
    } else if (!emailRegex.test(guardianEmail.trim())) {
      errs.guardianEmail = 'Ingrese un formato de correo electrónico válido (ej. usuario@dominio.com).';
    }

    const cleanPhone = guardianPhone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) {
      errs.guardianPhone = 'El número de contacto telefónico es obligatorio.';
    } else if (!/^\d{7,10}$/.test(cleanPhone)) {
      errs.guardianPhone = 'Ingrese un número válido de Colombia (7 a 10 dígitos, ej. 3123456789).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setServerError(null);
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    setServerError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setServerError('Existen campos obligatorios incompletos o con errores. Por favor revise el formulario.');
      return;
    }

    setSubmitting(true);
    setServerError(null);

    const selectedStop = busStops.find(b => b.id === busStopId);

    const payload = {
      status: 'CONTINUA',
      student: {
        fullName: studentFullName.trim(),
        documentType: studentDocType,
        documentTypeOther: studentDocType === 'Otro' ? studentDocTypeOther.trim() : undefined,
        documentNumber: studentDocNum.trim(),
        institution: studentInstitution,
        grade: studentGrade,
        hasSisben: studentHasSisben,
        sisbenLevel: studentHasSisben ? studentSisbenLevel.trim() : undefined,
        sisbenMunicipality: studentHasSisben ? studentSisbenMun.trim() : undefined,
        busStopId: busStopId,
        busStopName: selectedStop?.name || 'Paradero no especificado',
        vigencia: 2027,
        notes: notes.trim(),
      },
      guardian: {
        fullName: guardianFullName.trim(),
        documentType: guardianDocType,
        documentTypeOther: guardianDocType === 'Otro' ? guardianDocTypeOther.trim() : undefined,
        documentNumber: guardianDocNum.trim(),
        hasSisben: guardianHasSisben,
        sisbenLevel: guardianHasSisben ? guardianSisbenLevel.trim() : undefined,
        sisbenMunicipality: guardianHasSisben ? guardianSisbenMun.trim() : undefined,
        email: guardianEmail.trim().toLowerCase(),
        phone: guardianPhone.trim(),
      },
      authorization: {
        accepted: authAccepted,
        policyVersion: '1.0-Ley1581',
      },
    };

    try {
      const res = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al enviar la inscripción.');
      }

      onSuccess(data.inscription);
    } catch (err: any) {
      setServerError(err.message || 'Error de comunicación con el servidor institucional.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Autorización Datos', icon: ShieldCheck },
    { num: 2, label: 'Estudiante & Paradero', icon: User },
    { num: 3, label: 'Acudiente & Contacto', icon: Users },
    { num: 4, label: 'Confirmación y Envío', icon: CheckCircle2 },
  ];

  const selectedStop = busStops.find(b => b.id === busStopId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Institutional Top Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/60 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-500/30">
                <School className="w-3.5 h-3.5" />
                Vigencia Contractual 2027
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">
                Formulario de Continuidad de Transporte Escolar
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                Alcaldía Municipal de Nobsa
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-blue-200 hover:text-white underline underline-offset-4 transition-colors"
            >
              Cambiar selección inicial
            </button>
          </div>

          {/* Stepper Header */}
          <div className="mt-8 pt-6 border-t border-blue-700/50">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {steps.map((st) => {
                const Icon = st.icon;
                const isActive = currentStep === st.num;
                const isPassed = currentStep > st.num;

                return (
                  <div key={st.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                        isActive
                          ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/30 scale-105'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-800/80 text-blue-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium mt-2 hidden sm:block ${
                        isActive ? 'text-white font-bold' : isPassed ? 'text-blue-200' : 'text-blue-300/70'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar Line */}
            <div className="relative mt-4 h-1.5 bg-blue-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Global Server Error Notification */}
        {serverError && (
          <div className="m-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-0.5">Atención: No se pudo completar el registro</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        {/* Form Body Container */}
        <div className="p-6 sm:p-8">
          {/* ===================== PASO 1: AUTORIZACIÓN LEY 1581 ===================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Sección 1 de 4
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Autorización para el Tratamiento de Datos Personales
                </h3>
                <p className="text-xs text-slate-500">
                  Requisito legal obligatorio según la Ley Estatutaria 1581 de 2012 de la República de Colombia.
                </p>
              </div>

              {/* Exact Text Box Required by User Prompt */}
              <div className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                      "{authorizationText}"
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1.5 underline underline-offset-4"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Consultar la política completa de tratamiento de datos personales
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox Obligatoria */}
              <div className="pt-2">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  authAccepted 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : errors.auth 
                    ? 'border-red-300 bg-red-50/40' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={authAccepted}
                    onChange={(e) => {
                      setAuthAccepted(e.target.checked);
                      if (e.target.checked && errors.auth) {
                        const newErrs = { ...errors };
                        delete newErrs.auth;
                        setErrors(newErrs);
                      }
                    }}
                    className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold block text-sm mb-0.5">
                      Acepto la autorización de tratamiento de datos personales *
                    </span>
                    Certifico que soy el padre, madre o acudiente legalmente autorizado del estudiante, y doy mi consentimiento expreso e informado a la Alcaldía Municipal de Nobsa.
                  </div>
                </label>
                {errors.auth && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.auth}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===================== PASO 2: INFORMACIÓN DEL ESTUDIANTE ===================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Sección 2 de 4
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Información del Estudiante y Selección de Paradero
                </h3>
                <p className="text-xs text-slate-500">
                  Diligencie los campos exactamente como aparecen en el documento de identidad oficial.
                </p>
              </div>

              {/* Nombres y Apellidos */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Nombres y apellidos completos del estudiante <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    placeholder="Escriba tal como aparecen en el documento de identidad"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                      errors.studentFullName ? 'border-red-400 bg-red-50/20 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                {errors.studentFullName && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.studentFullName}
                  </p>
                )}
              </div>

              {/* Tipo y Número de Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    2. Tipo de documento de identidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentDocType}
                    onChange={(e) => setStudentDocType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all bg-white text-slate-800"
                  >
                    <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                    <option value="Registro Civil">Registro Civil</option>
                    <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                    <option value="PPT">PPT (Permiso por Protección Temporal)</option>
                    <option value="Otro">Otro (Especificar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    3. Número de documento de identidad <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentDocNum}
                      onChange={(e) => setStudentDocNum(e.target.value)}
                      placeholder="Sin puntos ni comas (ej. 1057891234)"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                        errors.studentDocNum ? 'border-red-400 bg-red-50/20 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.studentDocNum && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.studentDocNum}
                    </p>
                  )}
                </div>
              </div>

              {/* Conditional "Otro" document type */}
              {studentDocType === 'Otro' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Especifique el tipo de documento del estudiante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentDocTypeOther}
                    onChange={(e) => setStudentDocTypeOther(e.target.value)}
                    placeholder="Ej. Cédula de Extranjería, Pasaporte, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-sm outline-none"
                  />
                  {errors.studentDocTypeOther && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {errors.studentDocTypeOther}
                    </p>
                  )}
                </div>
              )}

              {/* Institución Educativa y Grado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    4. Institución Educativa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentInstitution}
                    onChange={(e) => setStudentInstitution(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white text-slate-800 ${
                      errors.studentInstitution ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  >
                    <option value="">Seleccione la institución...</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.fullName}>
                        {inst.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.studentInstitution && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.studentInstitution}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    5. Grado escolar a cursar en 2027 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white text-slate-800 ${
                      errors.studentGrade ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  >
                    <option value="">Seleccione el grado...</option>
                    {grades.map((gr) => (
                      <option key={gr} value={gr}>
                        {gr}
                      </option>
                    ))}
                  </select>
                  {errors.studentGrade && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.studentGrade}
                    </p>
                  )}
                </div>
              </div>

              {/* SECCIÓN 3: SISBÉN DEL ESTUDIANTE */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    ¿El estudiante cuenta con clasificación SISBÉN? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition-all ${
                      studentHasSisben 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="studentSisben"
                        checked={studentHasSisben === true}
                        onChange={() => setStudentHasSisben(true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Sí, cuenta con SISBÉN
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition-all ${
                      !studentHasSisben 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="studentSisben"
                        checked={studentHasSisben === false}
                        onChange={() => {
                          setStudentHasSisben(false);
                          setStudentSisbenLevel('');
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      No cuenta con SISBÉN
                    </label>
                  </div>
                </div>

                {/* Conditional SISBÉN Fields */}
                {studentHasSisben && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Nivel SISBÉN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentSisbenLevel}
                        onChange={(e) => setStudentSisbenLevel(e.target.value.toUpperCase())}
                        placeholder="Ej. A1, A2, B1, B4, C2"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          errors.studentSisbenLevel ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {errors.studentSisbenLevel && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {errors.studentSisbenLevel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        ¿De qué municipio? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentSisbenMun}
                        onChange={(e) => setStudentSisbenMun(e.target.value)}
                        placeholder="Ej. Nobsa, Sogamoso, Duitama..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          errors.studentSisbenMun ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {errors.studentSisbenMun && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {errors.studentSisbenMun}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 4: SELECCIÓN DEL PARADERO */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Paradero donde el estudiante toma o abordará el transporte escolar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={busStopId}
                    onChange={(e) => setBusStopId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white text-slate-800 appearance-none font-medium ${
                      errors.busStopId ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  >
                    <option value="">Seleccione el paradero oficial (44 paraderos disponibles)...</option>
                    {busStops.map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.orderNumber}. {stop.name} {stop.operationalNote ? `[${stop.operationalNote}]` : ''}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-5 h-5 text-blue-600 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.busStopId && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.busStopId}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Nota: Las opciones corresponden exactamente al censo de paraderos del municipio de Nobsa.
                </p>
              </div>
            </div>
          )}

          {/* ===================== PASO 3: INFORMACIÓN DEL ACUDIENTE ===================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Sección 3 de 4
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Información y Contacto del Acudiente
                </h3>
                <p className="text-xs text-slate-500">
                  Datos del padre de familia, madre o acudiente legal responsable del estudiante.
                </p>
              </div>

              {/* Nombres y Apellidos Acudiente */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  1. Nombres y apellidos completos del acudiente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guardianFullName}
                    onChange={(e) => setGuardianFullName(e.target.value)}
                    placeholder="Ej. Diana Marcela Vargas Rodríguez"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                      errors.guardianFullName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                {errors.guardianFullName && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.guardianFullName}
                  </p>
                )}
              </div>

              {/* Tipo y Número de Documento Acudiente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    2. Tipo de documento de identidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={guardianDocType}
                    onChange={(e) => setGuardianDocType(e.target.value as DocumentType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm outline-none bg-white text-slate-800"
                  >
                    <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                    <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                    <option value="Registro Civil">Registro Civil</option>
                    <option value="PPT">PPT (Permiso por Protección Temporal)</option>
                    <option value="Otro">Otro (Especificar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    3. Número de documento de identidad <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guardianDocNum}
                      onChange={(e) => setGuardianDocNum(e.target.value)}
                      placeholder="Número sin puntos (ej. 46382910)"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                        errors.guardianDocNum ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.guardianDocNum && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.guardianDocNum}
                    </p>
                  )}
                </div>
              </div>

              {guardianDocType === 'Otro' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Especifique el tipo de documento del acudiente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guardianDocTypeOther}
                    onChange={(e) => setGuardianDocTypeOther(e.target.value)}
                    placeholder="Ej. Cédula de Extranjería, Pasaporte, etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-blue-600 text-sm outline-none"
                  />
                  {errors.guardianDocTypeOther && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      {errors.guardianDocTypeOther}
                    </p>
                  )}
                </div>
              )}

              {/* SECCIÓN 6: SISBÉN DEL ACUDIENTE */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    ¿El acudiente cuenta con clasificación SISBÉN? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition-all ${
                      guardianHasSisben 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="guardianSisben"
                        checked={guardianHasSisben === true}
                        onChange={() => setGuardianHasSisben(true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Sí, cuenta con SISBÉN
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-bold text-xs transition-all ${
                      !guardianHasSisben 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="guardianSisben"
                        checked={guardianHasSisben === false}
                        onChange={() => {
                          setGuardianHasSisben(false);
                          setGuardianSisbenLevel('');
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      No cuenta con SISBÉN
                    </label>
                  </div>
                </div>

                {guardianHasSisben && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Nivel SISBÉN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guardianSisbenLevel}
                        onChange={(e) => setGuardianSisbenLevel(e.target.value.toUpperCase())}
                        placeholder="Ej. A1, B2, C1"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          errors.guardianSisbenLevel ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {errors.guardianSisbenLevel && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {errors.guardianSisbenLevel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        ¿De qué municipio? <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guardianSisbenMun}
                        onChange={(e) => setGuardianSisbenMun(e.target.value)}
                        placeholder="Ej. Nobsa, Sogamoso, Duitama..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          errors.guardianSisbenMun ? 'border-red-400 bg-red-50/20' : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {errors.guardianSisbenMun && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {errors.guardianSisbenMun}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 7: CONTACTO DEL ACUDIENTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Correo electrónico del acudiente <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                        errors.guardianEmail ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.guardianEmail && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.guardianEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Contacto telefónico / celular <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="Número de celular (10 dígitos)"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-slate-400 ${
                        errors.guardianPhone ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.guardianPhone && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.guardianPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Observaciones opcionales */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Observaciones o requerimientos especiales (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Indique si el estudiante cuenta con alguna condición médica, discapacidad o indicación especial para el transporte..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ===================== PASO 4: REVISIÓN Y ENVÍO OFICIAL ===================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Sección 4 de 4
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Verificación de Datos y Confirmación de Radicación
                </h3>
                <p className="text-xs text-slate-500">
                  Por favor revise cuidadosamente la información antes de generar el radicado oficial.
                </p>
              </div>

              {/* Review Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estudiante Card */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-blue-900 font-bold text-sm">
                    <User className="w-4 h-4 text-blue-700" />
                    Estudiante
                  </div>
                  <dl className="space-y-2 text-xs">
                    <div>
                      <dt className="text-slate-500 font-medium">Nombres completos:</dt>
                      <dd className="font-bold text-slate-800 text-sm">{studentFullName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Documento:</dt>
                      <dd className="font-semibold text-slate-800">
                        {studentDocType === 'Otro' ? studentDocTypeOther : studentDocType}: {studentDocNum}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Institución Educativa:</dt>
                      <dd className="font-semibold text-slate-800">{studentInstitution}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Grado 2027:</dt>
                      <dd className="font-semibold text-slate-800">{studentGrade}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">SISBÉN:</dt>
                      <dd className="font-semibold text-slate-800">
                        {studentHasSisben ? `SÍ (Nivel ${studentSisbenLevel} - ${studentSisbenMun})` : 'NO'}
                      </dd>
                    </div>
                    <div className="pt-2 border-t border-blue-200/60">
                      <dt className="text-blue-700 font-bold">Paradero seleccionado:</dt>
                      <dd className="font-extrabold text-blue-950 text-sm flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-4 h-4 text-blue-700 flex-shrink-0" />
                        {selectedStop?.orderNumber}. {selectedStop?.name}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Acudiente Card */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-emerald-900 font-bold text-sm">
                    <Users className="w-4 h-4 text-emerald-700" />
                    Acudiente Responsable
                  </div>
                  <dl className="space-y-2 text-xs">
                    <div>
                      <dt className="text-slate-500 font-medium">Nombres completos:</dt>
                      <dd className="font-bold text-slate-800 text-sm">{guardianFullName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Documento:</dt>
                      <dd className="font-semibold text-slate-800">
                        {guardianDocType === 'Otro' ? guardianDocTypeOther : guardianDocType}: {guardianDocNum}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">SISBÉN Acudiente:</dt>
                      <dd className="font-semibold text-slate-800">
                        {guardianHasSisben ? `SÍ (Nivel ${guardianSisbenLevel} - ${guardianSisbenMun})` : 'NO'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Correo Electrónico:</dt>
                      <dd className="font-semibold text-slate-800">{guardianEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 font-medium">Teléfono / Celular:</dt>
                      <dd className="font-semibold text-slate-800">{guardianPhone}</dd>
                    </div>
                    {notes && (
                      <div className="pt-2 border-t border-emerald-200/60">
                        <dt className="text-slate-500 font-medium">Observaciones:</dt>
                        <dd className="italic text-slate-700">{notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Declaración Juramentada */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Confirmación previa a radicación oficial</p>
                  <p>
                    Al hacer clic en "Enviar Inscripción Oficial 2027", el sistema generará su radicado único y comprobante oficial en formato PDF. Asegúrese de que el paradero seleccionado sea el correcto para la planeación logística de las rutas escolares de Nobsa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-8 mt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancelar y Salir
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all inline-flex items-center gap-2.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registrando en sistema...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Inscripción Oficial 2027
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setAuthAccepted(true)}
      />
    </div>
  );
};
