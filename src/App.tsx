import React, { useEffect, useState } from "react";
import {
  Bus,
  School,
  MapPin,
  CheckCircle2,
  XCircle,
  Calendar,
  ShieldCheck,
  FileText,
  ArrowRight,
  HelpCircle,
  Phone,
  Mail,
  Building,
  RefreshCw,
  Users,
} from "lucide-react";
import { BusStop, EducationalInstitution, Inscription } from "./types";
import { Navbar } from "./components/Navbar";
import { StudentForm } from "./components/StudentForm";
import { DeclineForm } from "./components/DeclineForm";
import { SuccessConfirmation } from "./components/SuccessConfirmation";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminInscriptions } from "./components/AdminInscriptions";
import { AdminBusStops } from "./components/AdminBusStops";
import { AdminInstitutions } from "./components/AdminInstitutions";
import { AdminAuditLogs } from "./components/AdminAuditLogs";
import { NobsaLogo } from "./components/NobsaLogo";
import { PrivacyModal } from "./components/PrivacyModal";

export default function App() {
  // Public Configuration
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>(
    [],
  );
  const [grades, setGrades] = useState<string[]>([]);
  const [authorizationText, setAuthorizationText] = useState<string>("");
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // App Navigation View: 'citizen' or 'admin'
  const [currentView, setCurrentView] = useState<"citizen" | "admin">(
    "citizen",
  );

  // Citizen sub-views
  const [citizenStep, setCitizenStep] = useState<
    | "initial-question"
    | "enrollment-form"
    | "decline-form"
    | "success"
    | "decline-success"
  >("initial-question");
  const [lastCreatedInscription, setLastCreatedInscription] =
    useState<Inscription | null>(null);

  // Admin state
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [adminTab, setAdminTab] = useState<
    "dashboard" | "inscriptions" | "bus-stops" | "institutions" | "audit"
  >("dashboard");
  const [inscriptionsFilter, setInscriptionsFilter] = useState<
    { institution?: string; status?: string } | undefined
  >(undefined);

  // Privacy Policy modal
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Fetch Public Configuration
  const fetchConfig = async (showLoading = false) => {
    setConfigError(null);
    if (showLoading) setConfigLoading(true);
    try {
      const res = await fetch("/api/public/config");
      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error("El servidor no respondió como API. Verifique la función /api y la conexión a MongoDB en Vercel.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No fue posible cargar colegios, grados y paraderos.");
      }

      setBusStops(data.busStops || []);
      setInstitutions(data.institutions || []);
      setGrades(data.grades || []);
      setAuthorizationText(data.authorizationText || "");
    } catch (error) {
      console.error("Error fetching config:", error);
      setConfigError(error instanceof Error ? error.message : "Error al cargar los datos del formulario.");
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig(true);

    // Check existing stored admin credentials
    const token = localStorage.getItem("nobsa_admin_token");
    const userStr = localStorage.getItem("nobsa_admin_user");
    if (token && userStr) {
      try {
        setAdminToken(token);
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem("nobsa_admin_token");
        localStorage.removeItem("nobsa_admin_user");
      }
    }
  }, []);

  // Admin Auth Handlers
  const handleAdminLogin = (user: any, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    setAdminTab("dashboard");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("nobsa_admin_token");
    localStorage.removeItem("nobsa_admin_user");
    setAdminToken(null);
    setAdminUser(null);
    setCurrentView("citizen");
  };

  const handleNavigateToInscriptions = (filter?: {
    institution?: string;
    status?: string;
  }) => {
    setInscriptionsFilter(filter);
    setAdminTab("inscriptions");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Institutional Top Navbar */}
      <Navbar
        currentView={currentView}
        adminTab={adminTab}
        adminUser={adminUser}
        onSelectView={(v) => setCurrentView(v)}
        onSelectAdminTab={(tab) => setAdminTab(tab)}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {configLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Cargando portal institucional de transporte escolar Nobsa 2027...
            </p>
          </div>
        ) : currentView === "citizen" && configError ? (
          <div className="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-semibold text-red-800">{configError}</p>
            <button
              onClick={() => fetchConfig(true)}
              className="mt-4 rounded-xl bg-blue-800 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900"
            >
              Volver a intentar
            </button>
          </div>
        ) : currentView === "citizen" ? (
          /* ========================================================================= */
          /*                          PORTAL CIUDADANO                                 */
          /* ========================================================================= */
          <div className="space-y-8">
            {citizenStep === "initial-question" && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
                {/* Institutional Hero Banner */}
                <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden text-center sm:text-left">
                  {/* Decorative coat of arms watermark */}
                  <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
                    <NobsaLogo className="w-80 h-80" variant="shield" />
                  </div>

                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-600/50">
                      <Calendar className="w-3.5 h-3.5" />
                      Proceso Oficial Vigencia 2027
                    </span>

                    <h1 className="text-2xl sm:text-4xl font-black font-['Plus_Jakarta_Sans'] tracking-tight leading-tight">
                      INSCRIPCIÓN AL SERVICIO DE TRANSPORTE ESCOLAR – VIGENCIA
                      2027
                    </h1>

                    <p className="text-sm sm:text-base font-semibold text-blue-200 mt-2">
                      Alcaldía Municipal de Nobsa – Boyacá.
                    </p>

                    <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
                      Plataforma oficial para la actualización y solicitud de
                      continuidad de estudiantes matriculados en las
                      instituciones educativas públicas del municipio de Nobsa
                      para el año lectivo 2027.
                    </p>
                  </div>
                </div>

                {/* Initial Mandatory Filter Question Box (Prompt Section 2) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-blue-100">
                  <div className="text-center max-w-xl mx-auto mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      Pregunta de selección obligatoria
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-3 font-['Plus_Jakarta_Sans'] leading-snug">
                      ¿El estudiante está interesado en continuar con el
                      servicio de transporte escolar durante la vigencia 2027?
                    </h2>
                    <p className="text-xs text-slate-500 mt-2">
                      Seleccione una opción para orientar el trámite
                      correspondiente.
                    </p>
                  </div>

                  {/* Two Main Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* Option SÍ */}
                    <button
                      type="button"
                      onClick={() => setCitizenStep("enrollment-form")}
                      className="p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/90 text-left transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="font-extrabold text-base sm:text-lg text-blue-950 mb-1">
                          Sí, desea continuar.
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Habilita el formulario de inscripción para registrar
                          paradero oficial (44 paraderos), datos del estudiante,
                          acudiente y SISBÉN.
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-blue-200 flex items-center justify-between text-xs font-bold text-blue-700">
                        <span>Iniciar formulario</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Option NO */}
                    <button
                      type="button"
                      onClick={() => setCitizenStep("decline-form")}
                      className="p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50 text-left transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                          <XCircle className="w-7 h-7" />
                        </div>
                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">
                          No, no desea continuar.
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Finaliza el trámite sin solicitar información personal
                          adicional, conservando únicamente el registro mínimo
                          para planeación.
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Registrar respuesta</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Informative Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        44 Paraderos Censados
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Conserva fielmente la totalidad de paraderos del Excel
                        municipal (3 Esquinas, Hornos de Cal, Canchas Cruz,
                        Parque Central, etc.).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        6 Sedes Educativas
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Técnico de Nazareth, I.E. Técnica Nobsa (Sede Central,
                        Kennedy, El Puente, San Martín y Dicho).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Ley 1581 de 2012
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Protección estricta de datos personales de menores de
                        edad y acudientes. Comprobante digital con código único.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view: Enrollment Multi-step Wizard */}
            {citizenStep === "enrollment-form" && (
              <StudentForm
                busStops={busStops}
                institutions={institutions}
                grades={grades}
                authorizationText={authorizationText}
                onCancel={() => setCitizenStep("initial-question")}
                onSuccess={(inscription) => {
                  setLastCreatedInscription(inscription);
                  setCitizenStep("success");
                }}
              />
            )}

            {/* Sub-view: Decline Form */}
            {citizenStep === "decline-form" && (
              <DeclineForm
                institutions={institutions}
                onBack={() => setCitizenStep("initial-question")}
                onSuccess={() => setCitizenStep("decline-success")}
              />
            )}

            {/* Sub-view: Success Confirmation with PDF */}
            {citizenStep === "success" && lastCreatedInscription && (
              <SuccessConfirmation
                inscription={lastCreatedInscription}
                onNewInscription={() => {
                  setLastCreatedInscription(null);
                  setCitizenStep("initial-question");
                }}
              />
            )}

            {/* Sub-view: Decline Acknowledged */}
            {citizenStep === "decline-success" && (
              <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  Constancia Registrada
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Su constancia de no continuidad en el servicio de transporte
                  escolar para la vigencia 2027 ha sido radicada correctamente.
                  No se solicitaron datos personales adicionales en cumplimiento
                  de las directrices municipales.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setCitizenStep("initial-question")}
                    className="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors"
                  >
                    Regresar al inicio
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /*                          PANEL ADMINISTRATIVO                             */
          /* ========================================================================= */
          <div>
            {!adminToken ? (
              <AdminLogin
                onLoginSuccess={handleAdminLogin}
                onBackToPublic={() => setCurrentView("citizen")}
              />
            ) : (
              <div className="space-y-6">
                {adminTab === "dashboard" && (
                  <AdminDashboard
                    token={adminToken}
                    institutions={institutions}
                    onNavigateToInscriptions={handleNavigateToInscriptions}
                  />
                )}

                {adminTab === "inscriptions" && (
                  <AdminInscriptions
                    token={adminToken}
                    institutions={institutions}
                    busStops={busStops}
                    initialFilter={inscriptionsFilter}
                  />
                )}

                {adminTab === "bus-stops" && (
                  <AdminBusStops
                    token={adminToken}
                    onRefreshStops={fetchConfig}
                  />
                )}

                {adminTab === "institutions" && (
                  <AdminInstitutions
                    token={adminToken}
                    onRefreshInstitutions={fetchConfig}
                  />
                )}

                {adminTab === "audit" && <AdminAuditLogs token={adminToken} />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-16 border-t-4 border-blue-700 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Identity */}
            <div className="md:col-span-2 space-y-3">
              <NobsaLogo variant="white" className="h-16 w-auto" />
              <p className="text-slate-400 max-w-md leading-relaxed text-[11px] pt-2">
                Plataforma oficial del Programa de Transporte Escolar Rural y
                Urbano. Diseñada para garantizar el derecho fundamental a la
                educación de niños, niñas y jóvenes nobsanos durante la vigencia
                2027.
              </p>
              <div className="text-[11px] text-slate-400">
                NIT: 891.801.109-1  · Código Postal: 152280 · Boyacá, Colombia.
              </div>
            </div>

            {/* Official Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Atención al Ciudadano
              </h4>
              <p className="flex items-center gap-2 text-slate-400">
                <Building className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                Palacio Municipal
              </p>
             
              <p className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                gestionsocial@nobsa-boyaca.gov.co
              </p>
              <p className="text-slate-400 text-[11px] pt-1">
                Lunes a Viernes: 8:00 AM – 12:00 M y 2:00 PM – 6:00 PM
              </p>
            </div>

            {/* Legal Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Transparencia y Ley
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="hover:text-white underline underline-offset-2 transition-colors"
                  >
                    Política de Tratamiento de Datos (Ley 1581)
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">
                    Plan de Desarrollo Municipal Nobsa
                  </span>
                </li>
               
                <li>
                  <span className="text-slate-500">
                    Ministerio de Educación Nacional
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              © 2026–2027 Alcaldía Municipal de Nobsa, Boyacá. Todos los
              derechos reservados.
            </div>
            <div>Vigencia Contractual de Transporte Escolar 2027</div>
          </div>
        </div>
      </footer>

      {/* Global Privacy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
