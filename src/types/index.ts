export type DocumentType = 
  | 'Registro Civil'
  | 'Tarjeta de identidad'
  | 'Cédula de ciudadanía'
  | 'PPT'
  | 'Otro';

export interface Student {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentTypeOther?: string;
  documentNumber: string;
  institution: string;
  grade: string;
  hasSisben: boolean;
  sisbenLevel?: string;
  sisbenMunicipality?: string;
  busStopId: string;
  busStopName: string;
  vigencia: number;
  createdAt: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentTypeOther?: string;
  documentNumber: string;
  hasSisben: boolean;
  sisbenLevel?: string;
  sisbenMunicipality?: string;
  email: string;
  phone: string;
}

export interface DataAuthorization {
  accepted: boolean;
  acceptedAt: string;
  policyVersion: string;
}

export interface Inscription {
  id: string; // e.g., "NOBSA-2027-TRP-00123"
  status: 'CONTINUA' | 'NO_CONTINUA';
  reasonNotContinuing?: string;
  declinationDetails?: {
    studentFullName?: string;
    documentNumber?: string;
    school?: string;
    reason?: string;
  };
  student?: Student;
  guardian?: Guardian;
  authorization?: DataAuthorization;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface BusStop {
  id: string;
  orderNumber: number;
  name: string;
  operationalNote?: string;
  active: boolean;
  studentCount?: number;
}

export interface EducationalInstitution {
  id: string;
  name: string;
  sede: string;
  fullName: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'FUNCIONARIO';
  active: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userId: string;
  action: string;
  recordType: 'INSCRIPCION' | 'PARADERO' | 'INSTITUCION' | 'USUARIO';
  recordId: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  totalInscriptions: number;
  continuingCount: number;
  notContinuingCount: number;
  byInstitution: { name: string; count: number }[];
  byGrade: { grade: string; count: number }[];
  byBusStop: { id: string; name: string; count: number }[];
  recentInscriptions: Inscription[];
}
