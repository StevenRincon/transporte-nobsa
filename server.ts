import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, type Collection } from 'mongodb';

import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'feria_robotica_nobsa';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const MONGO_STATE_ID = 'application-state';
let mongoClientPromise: Promise<MongoClient> | undefined;

// Initial 44 Bus Stops strictly from Excel
const INITIAL_BUS_STOPS = [
  "3 Esquinas",
  "La Chata",
  "Esc. Dicho",
  "Salitre",
  "Campanario",
  "Capilla Puntalarga",
  "Tienda La Oficina",
  "Acapulco",
  "Suazapawa",
  "Capilla de Ucuenga",
  "Las Minas",
  "Hornos de Cal",
  "Capilla Caleras",
  "Las Minas",
  "Hornos de Cal",
  "Capilla Caleras",
  "La Playita",
  "Transformador",
  "Bomba Texaco",
  "Areneras",
  "Romboy",
  "Asaderos",
  "Flia Cely",
  "Flia Martínez",
  "La Torre",
  "Canchas Cruz",
  "El Bosque",
  "Inspección de Policía",
  "Sector Triángulo",
  "Martha Mora",
  "Sector Alto",
  "JAC Chámeza Menor",
  "Biosaludable",
  "JAC Bonza",
  "Holcim",
  "Parque Central – Nobsa",
  "Asonobsa",
  "Holcim",
  "Bonza",
  "Parque Biosaludable",
  "Martha Mora",
  "Glorieta Gustavo Jiménez",
  "Límite Argos-Nazareth",
  "El Triángulo"
].map((name, index) => {
  // Check duplicates and add operational distinction note
  const countSoFar = [
    "3 Esquinas", "La Chata", "Esc. Dicho", "Salitre", "Campanario", "Capilla Puntalarga",
    "Tienda La Oficina", "Acapulco", "Suazapawa", "Capilla de Ucuenga", "Las Minas",
    "Hornos de Cal", "Capilla Caleras", "Las Minas", "Hornos de Cal", "Capilla Caleras",
    "La Playita", "Transformador", "Bomba Texaco", "Areneras", "Romboy", "Asaderos",
    "Flia Cely", "Flia Martínez", "La Torre", "Canchas Cruz", "El Bosque",
    "Inspección de Policía", "Sector Triángulo", "Martha Mora", "Sector Alto",
    "JAC Chámeza Menor", "Biosaludable", "JAC Bonza", "Holcim", "Parque Central – Nobsa",
    "Asonobsa", "Holcim", "Bonza", "Parque Biosaludable", "Martha Mora",
    "Glorieta Gustavo Jiménez", "Límite Argos-Nazareth", "El Triángulo"
  ].slice(0, index).filter(n => n === name).length;

  let note = '';
  if (countSoFar > 0) {
    note = `Paradero ${index + 1} (Ruta/Sector ${countSoFar + 1})`;
  }

  return {
    id: `stop-${index + 1}`,
    orderNumber: index + 1,
    name: name,
    operationalNote: note,
    active: true
  };
});

const INITIAL_INSTITUTIONS = [
  { id: 'inst-1', name: 'Técnico de Nazareth', sede: 'Sede Central', fullName: 'Técnico de Nazareth – Sede Central', active: true },
  { id: 'inst-2', name: 'Institución Educativa Técnica de Nobsa', sede: 'Sede Central', fullName: 'Institución Educativa Técnica de Nobsa – Sede Central', active: true },
  { id: 'inst-3', name: 'Institución Educativa Técnica de Nobsa', sede: 'Sede Kennedy', fullName: 'Institución Educativa Técnica de Nobsa – Sede Kennedy', active: true },
  { id: 'inst-4', name: 'Institución Educativa Técnica de Nobsa', sede: 'Sede El Puente', fullName: 'Institución Educativa Técnica de Nobsa – Sede El Puente', active: true },
  { id: 'inst-5', name: 'Institución Educativa Técnica de Nobsa', sede: 'Sede San Martín', fullName: 'Institución Educativa Técnica de Nobsa – Sede San Martín', active: true },
  { id: 'inst-6', name: 'Institución Educativa Técnica de Nobsa', sede: 'Sede Dicho', fullName: 'Institución Educativa Técnica de Nobsa – Sede Dicho', active: true },
];

const INITIAL_GRADES = [
  'Transición (Preescolar)',
  'Jardín (Preescolar)',
  'Primero (1° Primaria)',
  'Segundo (2° Primaria)',
  'Tercero (3° Primaria)',
  'Cuarto (4° Primaria)',
  'Quinto (5° Primaria)',
  'Sexto (6° Secundaria)',
  'Séptimo (7° Secundaria)',
  'Octavo (8° Secundaria)',
  'Noveno (9° Secundaria)',
  'Décimo (10° Media)',
  'Once (11° Media)'
];

// Seed initial demo data
function getInitialData() {
  const adminPasswordHash = bcrypt.hashSync('Nobsa2027*', 10);
  const funcionarioPasswordHash = bcrypt.hashSync('Funcionario2027*', 10);

  const initialUsers = [
    {
      id: 'usr-1',
      name: 'Ing. Hans Sebastian Barragan (Jefe Oficina de las TIC)',
      username: 'admin_nobsa',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      active: true,
      createdAt: '2026-11-01T08:00:00.000Z'
    },
    {
      id: 'usr-2',
      name: 'Doc. Nubia Yolima Mesa (Sec. de la Mujer y Programas sociales)',
      username: 'funcionario_nobsa',
      passwordHash: funcionarioPasswordHash,
      role: 'FUNCIONARIO',
      active: true,
      createdAt: '2026-11-01T08:30:00.000Z'
    }
  ];

  // Seed sample realistic inscriptions from Nobsa
  const sampleInscriptions = [
    {
      id: 'NOBSA-2027-TRP-00101',
      status: 'CONTINUA',
      student: {
        id: 'std-101',
        fullName: 'Mateo Alejandro Cely Vargas',
        documentType: 'Tarjeta de identidad',
        documentNumber: '1057482910',
        institution: 'Institución Educativa Técnica de Nobsa – Sede Central',
        grade: 'Octavo (8° Secundaria)',
        hasSisben: true,
        sisbenLevel: 'A1',
        sisbenMunicipality: 'Nobsa',
        busStopId: 'stop-36',
        busStopName: 'Parque Central – Nobsa',
        vigencia: 2027,
        createdAt: '2026-11-05T09:15:00.000Z'
      },
      guardian: {
        id: 'grd-101',
        fullName: 'Diana Marcela Vargas Rodríguez',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '46382910',
        hasSisben: true,
        sisbenLevel: 'A1',
        sisbenMunicipality: 'Nobsa',
        email: 'diana.vargas.cely@gmail.com',
        phone: '3124567890'
      },
      authorization: {
        accepted: true,
        acceptedAt: '2026-11-05T09:14:45.000Z',
        policyVersion: '1.0-Ley1581'
      },
      createdAt: '2026-11-05T09:15:00.000Z',
      notes: 'Estudiante con excelente rendimiento académico.'
    },
    {
      id: 'NOBSA-2027-TRP-00102',
      status: 'CONTINUA',
      student: {
        id: 'std-102',
        fullName: 'Sofía Valentina Salamanca Pérez',
        documentType: 'Tarjeta de identidad',
        documentNumber: '1058293011',
        institution: 'Técnico de Nazareth – Sede Central',
        grade: 'Décimo (10° Media)',
        hasSisben: true,
        sisbenLevel: 'B2',
        sisbenMunicipality: 'Nobsa',
        busStopId: 'stop-6',
        busStopName: 'Capilla Puntalarga',
        vigencia: 2027,
        createdAt: '2026-11-06T10:30:00.000Z'
      },
      guardian: {
        id: 'grd-102',
        fullName: 'Héctor Fernando Salamanca Rincón',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '9582710',
        hasSisben: true,
        sisbenLevel: 'B2',
        sisbenMunicipality: 'Nobsa',
        email: 'hector.salamanca@hotmail.com',
        phone: '3109876543'
      },
      authorization: {
        accepted: true,
        acceptedAt: '2026-11-06T10:29:10.000Z',
        policyVersion: '1.0-Ley1581'
      },
      createdAt: '2026-11-06T10:30:00.000Z'
    },
    {
      id: 'NOBSA-2027-TRP-00103',
      status: 'CONTINUA',
      student: {
        id: 'std-103',
        fullName: 'Santiago David Barrera Guío',
        documentType: 'Registro Civil',
        documentNumber: '1102938475',
        institution: 'Institución Educativa Técnica de Nobsa – Sede Kennedy',
        grade: 'Tercero (3° Primaria)',
        hasSisben: false,
        busStopId: 'stop-1',
        busStopName: '3 Esquinas',
        vigencia: 2027,
        createdAt: '2026-11-07T14:20:00.000Z'
      },
      guardian: {
        id: 'grd-103',
        fullName: 'Luz Marina Guío Chaparro',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '40382911',
        hasSisben: false,
        email: 'luz.barrera.guio@gmail.com',
        phone: '3157891234'
      },
      authorization: {
        accepted: true,
        acceptedAt: '2026-11-07T14:19:00.000Z',
        policyVersion: '1.0-Ley1581'
      },
      createdAt: '2026-11-07T14:20:00.000Z'
    },
    {
      id: 'NOBSA-2027-TRP-00104',
      status: 'CONTINUA',
      student: {
        id: 'std-104',
        fullName: 'María Camila Flórez Niño',
        documentType: 'Tarjeta de identidad',
        documentNumber: '1056382914',
        institution: 'Institución Educativa Técnica de Nobsa – Sede San Martín',
        grade: 'Quinto (5° Primaria)',
        hasSisben: true,
        sisbenLevel: 'A3',
        sisbenMunicipality: 'Nobsa',
        busStopId: 'stop-3',
        busStopName: 'Esc. Dicho',
        vigencia: 2027,
        createdAt: '2026-11-08T11:45:00.000Z'
      },
      guardian: {
        id: 'grd-104',
        fullName: 'Jorge Eduardo Flórez Castro',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '74182930',
        hasSisben: true,
        sisbenLevel: 'A3',
        sisbenMunicipality: 'Nobsa',
        email: 'jorge.florez@colombia.com',
        phone: '3203456781'
      },
      authorization: {
        accepted: true,
        acceptedAt: '2026-11-08T11:44:20.000Z',
        policyVersion: '1.0-Ley1581'
      },
      createdAt: '2026-11-08T11:45:00.000Z'
    },
    {
      id: 'NOBSA-2027-TRP-00105',
      status: 'NO_CONTINUA',
      declinationDetails: {
        studentFullName: 'Juan Camilo Becerra Pinto',
        documentNumber: '1057893201',
        school: 'Técnico de Nazareth – Sede Central',
        reason: 'Cambio de residencia familiar a Duitama'
      },
      createdAt: '2026-11-09T16:10:00.000Z'
    }
  ];

  const initialAuditLogs = [
    {
      id: 'log-1',
      userName: 'Sistema Automático',
      userId: 'system',
      action: 'INICIALIZACION_SISTEMA',
      recordType: 'SISTEMA',
      recordId: 'init',
      details: 'Inicialización de la plataforma de transporte escolar Nobsa 2027 con 44 paraderos y 6 sedes institucionales.',
      timestamp: '2026-11-01T08:00:00.000Z'
    }
  ];

  return {
    nextSequentialId: 106,
    busStops: INITIAL_BUS_STOPS,
    institutions: INITIAL_INSTITUTIONS,
    grades: INITIAL_GRADES,
    users: initialUsers,
    inscriptions: [],
    auditLogs: initialAuditLogs
  };
}

let defaultDatabase: DbSchema | undefined;

function getDefaultDatabase(): DbSchema {
  defaultDatabase ??= getInitialData();
  return defaultDatabase;
}

// Database helper functions
interface DbSchema {
  nextSequentialId: number;
  busStops: any[];
  institutions: any[];
  grades: string[];
  users: any[];
  inscriptions: any[];
  auditLogs: any[];
}

type StoredDbSchema = DbSchema & { _id: string };

function getMongoCollection(): Promise<Collection<StoredDbSchema>> {
  if (!MONGODB_URI) {
    throw new Error('Falta configurar MONGODB_URI para conectar la base de datos.');
  }

  mongoClientPromise ??= new MongoClient(MONGODB_URI).connect();
  return mongoClientPromise.then((client) =>
    client.db(MONGODB_DB).collection<StoredDbSchema>('applicationState')
  );
}

function normalizeDatabase(parsed: unknown): DbSchema {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('La base de datos no contiene un objeto JSON válido.');
  }

  const data = parsed as Partial<DbSchema>;
  const defaults = getDefaultDatabase();
  return {
    nextSequentialId: Number.isInteger(data.nextSequentialId) ? data.nextSequentialId! : defaults.nextSequentialId,
    busStops: Array.isArray(data.busStops) ? data.busStops : structuredClone(defaults.busStops),
    institutions: Array.isArray(data.institutions) ? data.institutions : structuredClone(defaults.institutions),
    grades: Array.isArray(data.grades) ? data.grades : [...defaults.grades],
    users: Array.isArray(data.users) ? data.users : structuredClone(defaults.users),
    inscriptions: Array.isArray(data.inscriptions) ? data.inscriptions : [],
    auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : structuredClone(defaults.auditLogs)
  };
}

function readLegacyDatabase(): DbSchema | undefined {
  if (!fs.existsSync(DB_FILE)) return undefined;
  return normalizeDatabase(JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')));
}

async function loadDatabase(): Promise<DbSchema> {
  if (MONGODB_URI) {
    const collection = await getMongoCollection();
    const stored = await collection.findOne({ _id: MONGO_STATE_ID });
    if (stored) {
      const { _id: _storedId, ...db } = stored;
      return readDatabaseState(db);
    }

    const initial = readLegacyDatabase() ?? getInitialData();
    try {
      await collection.insertOne({ ...initial, _id: MONGO_STATE_ID });
      return initial;
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      const concurrentSeed = await collection.findOne({ _id: MONGO_STATE_ID });
      if (!concurrentSeed) throw error;
      const { _id: _storedId, ...db } = concurrentSeed;
      return readDatabaseState(db);
    }
  }

  if (process.env.VERCEL) {
    throw new Error('Falta configurar MONGODB_URI en las variables de entorno de Vercel.');
  }

  const legacy = readLegacyDatabase();
  if (legacy) return legacy;

  const initial = getInitialData();
  await saveDatabase(initial);
  return initial;
}

function readDatabaseState(value: unknown): DbSchema {
  return normalizeDatabase(value);
}

async function saveDatabase(db: DbSchema): Promise<void> {
  if (MONGODB_URI) {
    const collection = await getMongoCollection();
    await collection.replaceOne(
      { _id: MONGO_STATE_ID },
      { ...db },
      { upsert: true }
    );
    return;
  }

  if (process.env.VERCEL) {
    throw new Error('Falta configurar MONGODB_URI en las variables de entorno de Vercel.');
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function getRequestDatabase(req: Request): DbSchema {
  const db = (req as DbRequest).db;
  if (!db) throw new Error('No se cargó la base de datos para esta solicitud.');
  return db;
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function logAudit(db: DbSchema, user: { name: string; id: string }, action: string, recordType: string, recordId: string, details: string) {
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userName: user.name,
    userId: user.id,
    action,
    recordType,
    recordId,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
}

// Auth Middleware
interface AuthRequest extends Request {
  db?: DbSchema;
  user?: {
    id: string;
    username: string;
    name: string;
    role: 'ADMIN' | 'FUNCIONARIO';
  };
}

interface DbRequest extends Request {
  db?: DbSchema;
}

app.use('/api', asyncHandler(async (req, _res, next) => {
  (req as DbRequest).db = await loadDatabase();
  next();
}));

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('Falta configurar AUTH_SECRET (o JWT_SECRET) en las variables de entorno.');
  }
  return JWT_SECRET;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Debe iniciar sesión.' });
  }

  jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Sesión expirada o token inválido.' });
    }
    req.user = decoded;
    next();
  });
}

// ======================== API ROUTES ========================

app.get('/api/health', (req: Request, res: Response) => {
  const db = getRequestDatabase(req);
  res.json({
    ok: true,
    database: {
      connected: true,
      provider: MONGODB_URI ? 'MongoDB' : 'JSON local',
      institutions: db.institutions.length,
      grades: db.grades.length,
      busStops: db.busStops.length
    }
  });
});

// 1. Public Configuration Route
app.get('/api/public/config', (req: Request, res: Response) => {
  const db = getRequestDatabase(req);
  res.json({
    vigencia: 2027,
    municipio: 'Nobsa',
    departamento: 'Boyacá',
    busStops: db.busStops.filter((b: any) => b.active),
    institutions: db.institutions.filter((i: any) => i.active),
    grades: db.grades,
    authorizationText: "De conformidad con la Ley 1581 de 2012, autorizo a la Alcaldía Municipal de Nobsa para recolectar y tratar los datos personales suministrados en este formulario, con el fin de identificar a los estudiantes interesados en continuar con el servicio de transporte escolar durante la vigencia 2027, garantizando la protección y confidencialidad de la información."
  });
});

// 2. Public Inscription Submission Route
app.post('/api/inscriptions', asyncHandler(async (req, res) => {
  const db = getRequestDatabase(req);
  const { status, student, guardian, authorization, declinationDetails } = req.body;

  if (!status || (status !== 'CONTINUA' && status !== 'NO_CONTINUA')) {
    return res.status(400).json({ error: 'Debe especificar si el estudiante desea continuar o no.' });
  }

  // Handle case: "No, no desea continuar"
  if (status === 'NO_CONTINUA') {
    const code = `NOBSA-2027-DESC-${String(db.nextSequentialId).padStart(5, '0')}`;
    db.nextSequentialId += 1;

    const record = {
      id: code,
      status: 'NO_CONTINUA',
      declinationDetails: {
        studentFullName: declinationDetails?.studentFullName || 'No especificado',
        documentNumber: declinationDetails?.documentNumber || 'No especificado',
        school: declinationDetails?.school || '',
        reason: declinationDetails?.reason || 'Decisión voluntaria del estudiante / acudiente'
      },
      createdAt: new Date().toISOString()
    };

    db.inscriptions.unshift(record);
    logAudit(db, { name: 'Portal Ciudadano', id: 'portal-publico' }, 'REGISTRO_NO_CONTINUIDAD', 'INSCRIPCION', code, `Registro de no continuidad para el servicio 2027 (${record.declinationDetails.studentFullName}).`);
    await saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Respuesta registrada correctamente. Gracias por notificar a la Alcaldía Municipal de Nobsa.',
      record
    });
  }

  // Handle case: "Sí, desea continuar" - Full Form Validations
  if (!authorization || !authorization.accepted) {
    return res.status(400).json({ error: 'Es obligatorio aceptar la autorización para el tratamiento de datos personales conforme a la Ley 1581 de 2012.' });
  }

  // Validate student
  if (!student) {
    return res.status(400).json({ error: 'Falta la información del estudiante.' });
  }

  const studentName = (student.fullName || '').trim();
  const studentDocType = (student.documentType || '').trim();
  const studentDocNum = (student.documentNumber || '').trim();
  const institution = (student.institution || '').trim();
  const grade = (student.grade || '').trim();
  const busStopId = (student.busStopId || '').trim();

  if (!studentName) {
    return res.status(400).json({ error: 'Los nombres y apellidos completos del estudiante son obligatorios.' });
  }
  if (!studentDocType) {
    return res.status(400).json({ error: 'El tipo de documento de identidad del estudiante es obligatorio.' });
  }
  if (studentDocType === 'Otro' && !student.documentTypeOther?.trim()) {
    return res.status(400).json({ error: 'Especifique el tipo de documento del estudiante.' });
  }
  if (!studentDocNum) {
    return res.status(400).json({ error: 'El número de documento del estudiante es obligatorio.' });
  }
  if (!institution) {
    return res.status(400).json({ error: 'La institución educativa es obligatoria.' });
  }
  if (!grade) {
    return res.status(400).json({ error: 'El grado del estudiante es obligatorio.' });
  }

  // SISBÉN student validation
  if (student.hasSisben) {
    if (!student.sisbenLevel || !student.sisbenLevel.trim()) {
      return res.status(400).json({ error: 'El nivel de SISBÉN del estudiante es obligatorio si marcó que sí cuenta con SISBÉN.' });
    }
    if (!student.sisbenMunicipality || !student.sisbenMunicipality.trim()) {
      return res.status(400).json({ error: 'El municipio del SISBÉN del estudiante es obligatorio.' });
    }
  }

  // Paradero validation
  if (!busStopId) {
    return res.status(400).json({ error: 'Debe seleccionar el paradero donde el estudiante abordará el transporte.' });
  }

  const selectedStop = db.busStops.find((b: any) => b.id === busStopId);
  if (!selectedStop) {
    return res.status(400).json({ error: 'El paradero seleccionado no es válido.' });
  }

  // Guardian validation
  if (!guardian) {
    return res.status(400).json({ error: 'Falta la información del acudiente.' });
  }

  const guardianName = (guardian.fullName || '').trim();
  const guardianDocType = (guardian.documentType || '').trim();
  const guardianDocNum = (guardian.documentNumber || '').trim();
  const guardianEmail = (guardian.email || '').trim().toLowerCase();
  const guardianPhone = (guardian.phone || '').trim();

  if (!guardianName) {
    return res.status(400).json({ error: 'Los nombres y apellidos del acudiente son obligatorios.' });
  }
  if (!guardianDocType) {
    return res.status(400).json({ error: 'El tipo de documento del acudiente es obligatorio.' });
  }
  if (guardianDocType === 'Otro' && !guardian.documentTypeOther?.trim()) {
    return res.status(400).json({ error: 'Especifique el tipo de documento del acudiente.' });
  }
  if (!guardianDocNum) {
    return res.status(400).json({ error: 'El número de documento del acudiente es obligatorio.' });
  }

  // SISBÉN guardian validation
  if (guardian.hasSisben) {
    if (!guardian.sisbenLevel || !guardian.sisbenLevel.trim()) {
      return res.status(400).json({ error: 'El nivel de SISBÉN del acudiente es obligatorio si cuenta con SISBÉN.' });
    }
    if (!guardian.sisbenMunicipality || !guardian.sisbenMunicipality.trim()) {
      return res.status(400).json({ error: 'El municipio del SISBÉN del acudiente es obligatorio.' });
    }
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!guardianEmail || !emailRegex.test(guardianEmail)) {
    return res.status(400).json({ error: 'Ingrese un correo electrónico válido para el acudiente.' });
  }

  // Colombian phone validation (digits, between 7 and 10 digits)
  const cleanPhone = guardianPhone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || !/^\d{7,10}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Ingrese un número telefónico o celular válido de Colombia (ej. 3123456789).' });
  }

  // Check duplicate registration for Vigencia 2027 by student document
  const normalizedDoc = studentDocNum.toLowerCase();
  const existing = db.inscriptions.find((insc: any) => 
    insc.status === 'CONTINUA' && 
    insc.student?.documentNumber?.toLowerCase() === normalizedDoc
  );

  if (existing) {
    return res.status(409).json({
      error: `Ya existe una inscripción registrada para la vigencia 2027 con el documento de identidad ${studentDocNum} a nombre de ${existing.student.fullName}. Código: ${existing.id}`
    });
  }

  // Generate unique code: NOBSA-2027-TRP-XXXXX
  const inscriptionCode = `NOBSA-2027-TRP-${String(db.nextSequentialId).padStart(5, '0')}`;
  db.nextSequentialId += 1;

  const now = new Date().toISOString();

  const newInscription = {
    id: inscriptionCode,
    status: 'CONTINUA',
    student: {
      id: `std-${Date.now()}`,
      fullName: studentName,
      documentType: studentDocType,
      documentTypeOther: studentDocType === 'Otro' ? student.documentTypeOther?.trim() : undefined,
      documentNumber: studentDocNum,
      institution,
      grade,
      hasSisben: !!student.hasSisben,
      sisbenLevel: student.hasSisben ? student.sisbenLevel?.trim() : undefined,
      sisbenMunicipality: student.hasSisben ? student.sisbenMunicipality?.trim() : undefined,
      busStopId: selectedStop.id,
      busStopName: selectedStop.name,
      vigencia: 2027,
      createdAt: now
    },
    guardian: {
      id: `grd-${Date.now()}`,
      fullName: guardianName,
      documentType: guardianDocType,
      documentTypeOther: guardianDocType === 'Otro' ? guardian.documentTypeOther?.trim() : undefined,
      documentNumber: guardianDocNum,
      hasSisben: !!guardian.hasSisben,
      sisbenLevel: guardian.hasSisben ? guardian.sisbenLevel?.trim() : undefined,
      sisbenMunicipality: guardian.hasSisben ? guardian.sisbenMunicipality?.trim() : undefined,
      email: guardianEmail,
      phone: cleanPhone
    },
    authorization: {
      accepted: true,
      acceptedAt: now,
      policyVersion: '1.0-Ley1581'
    },
    createdAt: now,
    notes: student.notes || ''
  };

  db.inscriptions.unshift(newInscription);
  logAudit(
    db, 
    { name: 'Portal Ciudadano', id: 'portal-publico' }, 
    'NUEVA_INSCRIPCION', 
    'INSCRIPCION', 
    inscriptionCode, 
    `Inscripción registrada para el estudiante ${studentName} (${studentDocNum}) en paradero ${selectedStop.name}.`
  );
  await saveDatabase(db);

  return res.status(201).json({
    success: true,
    message: 'Inscripción registrada exitosamente',
    inscription: newInscription
  });
}));

// 3. Admin Authentication Route
app.post('/api/admin/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
  }

  const db = getRequestDatabase(req);
  const user = db.users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.active);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo.' });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };

  const token = jwt.sign(tokenPayload, getJwtSecret(), { expiresIn: '8h' });

  logAudit(db, user, 'INICIO_SESION', 'USUARIO', user.id, `Inicio de sesión exitoso del usuario ${user.username} (${user.role}).`);
  await saveDatabase(db);

  res.json({
    token,
    user: tokenPayload
  });
}));

// 4. Admin Current Profile Route
app.get('/api/admin/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// 5. Admin Dashboard Statistics Route
app.get('/api/admin/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  const total = db.inscriptions.length;
  const continuing = db.inscriptions.filter((i: any) => i.status === 'CONTINUA');
  const notContinuing = db.inscriptions.filter((i: any) => i.status === 'NO_CONTINUA');

  // Distribution by Institution
  const institutionMap: Record<string, number> = {};
  continuing.forEach((i: any) => {
    const inst = i.student?.institution || 'Sin asignar';
    institutionMap[inst] = (institutionMap[inst] || 0) + 1;
  });
  const byInstitution = Object.entries(institutionMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Distribution by Grade
  const gradeMap: Record<string, number> = {};
  continuing.forEach((i: any) => {
    const gr = i.student?.grade || 'Sin asignar';
    gradeMap[gr] = (gradeMap[gr] || 0) + 1;
  });
  const byGrade = Object.entries(gradeMap)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count);

  // Distribution by Bus Stop
  const stopMap: Record<string, { id: string; name: string; count: number }> = {};
  db.busStops.forEach((stop: any) => {
    stopMap[stop.id] = { id: stop.id, name: stop.name, count: 0 };
  });
  continuing.forEach((i: any) => {
    const stopId = i.student?.busStopId;
    if (stopId && stopMap[stopId]) {
      stopMap[stopId].count += 1;
    }
  });
  const byBusStop = Object.values(stopMap)
    .filter(s => s.count > 0 || true)
    .sort((a, b) => b.count - a.count);

  res.json({
    totalInscriptions: total,
    continuingCount: continuing.length,
    notContinuingCount: notContinuing.length,
    byInstitution,
    byGrade,
    byBusStop,
    recentInscriptions: db.inscriptions.slice(0, 10)
  });
});

// 6. Admin Inscriptions Management Route
app.get('/api/admin/inscriptions', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  const { search, institution, grade, busStopId, status } = req.query;

  let results = [...db.inscriptions];

  if (status && status !== 'ALL') {
    results = results.filter((i: any) => i.status === status);
  }

  if (institution) {
    results = results.filter((i: any) => i.student?.institution === institution);
  }

  if (grade) {
    results = results.filter((i: any) => i.student?.grade === grade);
  }

  if (busStopId) {
    results = results.filter((i: any) => i.student?.busStopId === busStopId);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    results = results.filter((i: any) => {
      const studentName = i.student?.fullName?.toLowerCase() || '';
      const studentDoc = i.student?.documentNumber?.toLowerCase() || '';
      const guardianName = i.guardian?.fullName?.toLowerCase() || '';
      const code = i.id?.toLowerCase() || '';
      const decName = i.declinationDetails?.studentFullName?.toLowerCase() || '';
      const decDoc = i.declinationDetails?.documentNumber?.toLowerCase() || '';
      return (
        studentName.includes(q) ||
        studentDoc.includes(q) ||
        guardianName.includes(q) ||
        code.includes(q) ||
        decName.includes(q) ||
        decDoc.includes(q)
      );
    });
  }

  res.json({
    count: results.length,
    inscriptions: results
  });
});

// 7. Get Single Inscription with Details
app.get('/api/admin/inscriptions/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  const found = db.inscriptions.find((i: any) => i.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Inscripción no encontrada.' });
  }

  // Also include audit entries for this record
  const recordLogs = db.auditLogs.filter((l: any) => l.recordId === req.params.id);

  res.json({
    inscription: found,
    history: recordLogs
  });
});

// 8. Update Inscription (Authorized Admin/Funcionario)
app.put('/api/admin/inscriptions/:id', authenticateToken, asyncHandler(async (req, res) => {
  const db = getRequestDatabase(req);
  const index = db.inscriptions.findIndex((i: any) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inscripción no encontrada.' });
  }

  const existing = db.inscriptions[index];
  const { student, guardian, notes } = req.body;

  // Track modification
  const beforeParadero = existing.student?.busStopName;
  const beforeGrade = existing.student?.grade;
  const beforeInst = existing.student?.institution;

  if (student) {
    existing.student = {
      ...existing.student,
      fullName: student.fullName || existing.student?.fullName,
      documentType: student.documentType || existing.student?.documentType,
      documentTypeOther: student.documentTypeOther,
      documentNumber: student.documentNumber || existing.student?.documentNumber,
      institution: student.institution || existing.student?.institution,
      grade: student.grade || existing.student?.grade,
      hasSisben: student.hasSisben !== undefined ? student.hasSisben : existing.student?.hasSisben,
      sisbenLevel: student.sisbenLevel,
      sisbenMunicipality: student.sisbenMunicipality,
      busStopId: student.busStopId || existing.student?.busStopId,
      busStopName: student.busStopName || existing.student?.busStopName
    };
  }

  if (guardian) {
    existing.guardian = {
      ...existing.guardian,
      fullName: guardian.fullName || existing.guardian?.fullName,
      documentType: guardian.documentType || existing.guardian?.documentType,
      documentTypeOther: guardian.documentTypeOther,
      documentNumber: guardian.documentNumber || existing.guardian?.documentNumber,
      hasSisben: guardian.hasSisben !== undefined ? guardian.hasSisben : existing.guardian?.hasSisben,
      sisbenLevel: guardian.sisbenLevel,
      sisbenMunicipality: guardian.sisbenMunicipality,
      email: guardian.email || existing.guardian?.email,
      phone: guardian.phone || existing.guardian?.phone
    };
  }

  if (notes !== undefined) {
    existing.notes = notes;
  }

  existing.updatedAt = new Date().toISOString();
  db.inscriptions[index] = existing;

  logAudit(
    db, 
    (req as AuthRequest).user!, 
    'EDICION_INSCRIPCION', 
    'INSCRIPCION', 
    existing.id, 
    `Modificación de registro ${existing.id}. Paradero: ${beforeParadero} -> ${existing.student?.busStopName}. Grado: ${beforeGrade} -> ${existing.student?.grade}. Institución: ${beforeInst} -> ${existing.student?.institution}.`
  );
  await saveDatabase(db);

  res.json({
    success: true,
    message: 'Inscripción actualizada correctamente.',
    inscription: existing
  });
}));

// 9. Bus Stops Management Routes
app.get('/api/admin/bus-stops', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  // Count students per stop
  const counts: Record<string, number> = {};
  db.inscriptions.forEach((i: any) => {
    if (i.status === 'CONTINUA' && i.student?.busStopId) {
      counts[i.student.busStopId] = (counts[i.student.busStopId] || 0) + 1;
    }
  });

  const stops = db.busStops.map((stop: any) => ({
    ...stop,
    studentCount: counts[stop.id] || 0
  }));

  res.json({ busStops: stops });
});

app.post('/api/admin/bus-stops', authenticateToken, asyncHandler(async (req, res) => {
  const { name, operationalNote } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del paradero es obligatorio.' });
  }

  const db = getRequestDatabase(req);
  const nextOrder = db.busStops.length + 1;
  const newStop = {
    id: `stop-${Date.now()}`,
    orderNumber: nextOrder,
    name: name.trim(),
    operationalNote: operationalNote ? operationalNote.trim() : '',
    active: true
  };

  db.busStops.push(newStop);
  logAudit(db, (req as AuthRequest).user!, 'CREAR_PARADERO', 'PARADERO', newStop.id, `Nuevo paradero creado: ${newStop.name}.`);
  await saveDatabase(db);

  res.status(201).json({ success: true, busStop: newStop });
}));

app.put('/api/admin/bus-stops/:id', authenticateToken, asyncHandler(async (req, res) => {
  const db = getRequestDatabase(req);
  const index = db.busStops.findIndex((b: any) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Paradero no encontrado.' });
  }

  const { name, operationalNote, active, orderNumber } = req.body;
  const stop = db.busStops[index];
  const oldName = stop.name;

  if (name !== undefined) stop.name = name.trim();
  if (operationalNote !== undefined) stop.operationalNote = operationalNote.trim();
  if (active !== undefined) stop.active = !!active;
  if (orderNumber !== undefined) stop.orderNumber = orderNumber;

  db.busStops[index] = stop;
  logAudit(db, (req as AuthRequest).user!, 'ACTUALIZAR_PARADERO', 'PARADERO', stop.id, `Paradero actualizado: ${oldName} -> ${stop.name}. Estado: ${stop.active ? 'Activo' : 'Inactivo'}.`);
  await saveDatabase(db);

  res.json({ success: true, busStop: stop });
}));

// 10. Institutions Management Routes
app.get('/api/admin/institutions', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  res.json({ institutions: db.institutions });
});

app.post('/api/admin/institutions', authenticateToken, asyncHandler(async (req, res) => {
  const { name, sede } = req.body;
  if (!name || !sede) {
    return res.status(400).json({ error: 'Nombre y sede son obligatorios.' });
  }
  const db = getRequestDatabase(req);
  const newInst = {
    id: `inst-${Date.now()}`,
    name: name.trim(),
    sede: sede.trim(),
    fullName: `${name.trim()} – ${sede.trim()}`,
    active: true
  };
  db.institutions.push(newInst);
  logAudit(db, (req as AuthRequest).user!, 'CREAR_INSTITUCION', 'INSTITUCION', newInst.id, `Nueva sede creada: ${newInst.fullName}.`);
  await saveDatabase(db);
  res.status(201).json({ success: true, institution: newInst });
}));

app.put('/api/admin/institutions/:id', authenticateToken, asyncHandler(async (req, res) => {
  const db = getRequestDatabase(req);
  const index = db.institutions.findIndex((i: any) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Institución no encontrada.' });
  }
  const { name, sede, active } = req.body;
  const inst = db.institutions[index];
  if (name !== undefined) inst.name = name.trim();
  if (sede !== undefined) inst.sede = sede.trim();
  if (name !== undefined || sede !== undefined) inst.fullName = `${inst.name} – ${inst.sede}`;
  if (active !== undefined) inst.active = !!active;

  db.institutions[index] = inst;
  logAudit(db, (req as AuthRequest).user!, 'ACTUALIZAR_INSTITUCION', 'INSTITUCION', inst.id, `Institución actualizada: ${inst.fullName} (${inst.active ? 'Activa' : 'Inactiva'}).`);
  await saveDatabase(db);
  res.json({ success: true, institution: inst });
}));

// 11. Audit Logs Route
app.get('/api/admin/audit-logs', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getRequestDatabase(req);
  res.json({ logs: db.auditLogs.slice(0, 100) });
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta API no encontrada.' });
});

app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API request failed:', err);
  if (_req.originalUrl.split('?')[0].endsWith('/api/health')) {
    return res.status(503).json({
      ok: false,
      database: {
        connected: false,
        provider: MONGODB_URI ? 'MongoDB' : 'JSON local'
      },
      error: MONGODB_URI
        ? 'No fue posible conectar con MongoDB. Revisa MONGODB_URI, MONGODB_DB y el acceso de red en Atlas.'
        : 'MONGODB_URI no está configurada en el servidor.'
    });
  }
  res.status(500).json({ error: 'Error del servidor al consultar o guardar la información.' });
});

if (process.env.VERCEL) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Vite Middleware for Dev vs Production Static
async function startServer() {
  await loadDatabase();
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nobsa Transporte 2027] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Error starting server:', err);
    process.exitCode = 1;
  });
}

export { app };
export default app;
