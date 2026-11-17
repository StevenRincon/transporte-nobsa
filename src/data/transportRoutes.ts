export interface TransportRoute {
  vereda: string;
  paraderos: string[];
  grados: number[];
  destino: string;
  veredasIncluidas?: string[];
}

const primaryGrades = [1, 2, 3, 4, 5];
const secondaryGrades = [6, 7, 8, 9];
const highSchoolGrades = [10, 11];

export const TRANSPORT_ROUTES: TransportRoute[] = [
  { vereda: 'SAN MARTIN Y DICHO', paraderos: ['3 ESQUINAS'], grados: [-2, -1], destino: 'NOBSANITOS' },
  { vereda: 'SAN MARTIN Y DICHO', paraderos: ['3 ESQUINAS'], grados: [0], destino: 'IET NOBSA - SAN MARTIN O DICHO' },
  { vereda: 'SAN MARTIN Y DICHO', paraderos: ['LA CHATA'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'SAN MARTIN Y DICHO', paraderos: ['ESC. DICHO'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'PUNTALARGA', paraderos: ['SALITRE'], grados: [-2, -1], destino: 'NOBSANITOS' },
  { vereda: 'PUNTALARGA', paraderos: ['SALITRE'], grados: [0], destino: 'IET NOBSA - SAN MARTIN O DICHO' },
  { vereda: 'PUNTALARGA', paraderos: ['SALITRE'], grados: primaryGrades, destino: 'IET NOBSA - SAN MARTIN O DICHO' },
  { vereda: 'PUNTALARGA', paraderos: ['CAMPANARIO'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'PUNTALARGA', paraderos: ['CAPILLA PUNTALARGA'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'UCUENGA', paraderos: ['TIENDA LA OFICINA'], grados: [-2, -1], destino: 'NOBSANITOS' },
  { vereda: 'UCUENGA', paraderos: ['ACAPULCO'], grados: [0], destino: 'IET NOBSA - UCUENGA' },
  { vereda: 'UCUENGA', paraderos: ['ACAPULCO'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'UCUENGA', paraderos: ['SUAZAPAWA'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'UCUENGA', paraderos: ['CAPILLA DE UCUENGA'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'CALERAS', paraderos: ['LAS MINAS'], grados: [], destino: 'NOBSANITOS' },
  { vereda: 'CALERAS', paraderos: ['HORNOS DE CAL'], grados: [-2, -1], destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'CALERAS', paraderos: ['CAPILLA CALERAS'], grados: [0], destino: 'IET NOBSA - EL PUENTE' },
  { vereda: 'CALERAS', paraderos: ['LA PLAYITA'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'CALERAS', paraderos: ['TRANSFORMADOR'], grados: [], destino: 'IET NOBSA - EL PUENTE' },
  { vereda: 'CALERAS', paraderos: ['BOMBA TEXACO'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'CALERAS', paraderos: ['ARENERAS'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'GUAQUIDA', paraderos: ['ROMBOY'], grados: [-2, -1, 0], destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'GUAQUIDA', paraderos: ['ROMBOY'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'GUAQUIDA', paraderos: ['ROMBOY'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'GUAQUIDA', paraderos: ['ASADEROS'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },
  {
    vereda: 'PUNTALARGA - UCUENGA - CALERAS - GUAQUIDA',
    paraderos: [],
    grados: primaryGrades,
    destino: 'IET NOBSA - KENNEDY',
    veredasIncluidas: ['PUNTALARGA', 'UCUENGA', 'CALERAS', 'GUAQUIDA'],
  },

  { vereda: 'SANTANA', paraderos: ['FLIA CELY'], grados: [-2, -1, 0], destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'SANTANA', paraderos: ['FLIA MARTINEZ'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'SANTANA', paraderos: ['LA TORRE'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },
  {
    vereda: 'SANTANA Y HORQUETA',
    paraderos: [],
    grados: primaryGrades,
    destino: 'IET NOBSA - KENNEDY',
    veredasIncluidas: ['SANTANA', 'HORQUETA'],
  },

  { vereda: 'HORQUETA', paraderos: ['CANCHAS CRUZ'], grados: [-2, -1, 0], destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'HORQUETA', paraderos: ['CANCHAS CRUZ'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'HORQUETA', paraderos: ['EL BOSQUE'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'NAZARETH', paraderos: ['INSPECCION DE POLICIA'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'NAZARETH', paraderos: ['INSPECCION DE POLICIA'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'NAZARETH', paraderos: ['INSPECCION DE POLICIA'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'CHAMEZAS', paraderos: ['SECTOR TRIANGULO', 'MARTHA MORA'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'CHAMEZAS', paraderos: ['SECTOR ALTO', 'JAC CHAMEZA MENOR'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'CHAMEZAS', paraderos: ['BIOSALUDABLE'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'BONZA', paraderos: ['JAC BONZA'], grados: [-2, -1, 0], destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'BONZA', paraderos: ['JAC BONZA'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'BONZA', paraderos: ['JAC BONZA'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'BONZA', paraderos: ['HOLCIM'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'NOBSA - CENTRO', paraderos: ['PARQUE CENTRAL - NOBSA'], grados: primaryGrades, destino: 'IET NOBSA - KENNEDY' },
  { vereda: 'NOBSA - CENTRO', paraderos: ['PARQUE CENTRAL - NOBSA'], grados: secondaryGrades, destino: 'IET NOBSA - CENTRAL' },
  { vereda: 'NOBSA - CENTRO', paraderos: ['ASONOBSA'], grados: highSchoolGrades, destino: 'IET NOBSA - CENTRAL' },

  { vereda: 'BONZA - CHAMEZAS', paraderos: ['HOLCIM', 'BONZA'], grados: [6, 7, 8, 9, 10, 11], destino: 'IET NAZARETH - CENTRAL' },
  { vereda: 'BONZA - CHAMEZAS', paraderos: ['PARQUE BIOSALUDABLE', 'MARTHA MORA'], grados: primaryGrades, destino: 'IET NAZARETH - CENTRAL' },
  { vereda: 'BONZA - CHAMEZAS', paraderos: ['GLORIETA GUSTAVO JIMENEZ', 'EL TRIANGULO'], grados: [6, 7, 8, 9, 10, 11], destino: 'IET NAZARETH - CENTRAL' },

  { vereda: 'NAZARETH', paraderos: ['LIMITE ARGOS-NAZARETH'], grados: [-2, -1, 0], destino: 'IET NAZARETH - CENTRAL' },
  { vereda: 'NAZARETH', paraderos: ['LIMITE ARGOS-NAZARETH'], grados: primaryGrades, destino: 'IET NAZARETH - CENTRAL' },
  { vereda: 'NAZARETH', paraderos: ['LIMITE ARGOS-NAZARETH'], grados: [6, 7, 8, 9, 10, 11], destino: 'IET NAZARETH - CENTRAL' },
];

export const normalizeTransportName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toUpperCase();

export function gradeCodeFromLabel(grade: string): number | undefined {
  const normalized = normalizeTransportName(grade);
  if (normalized.includes('PREJARDIN')) return -1;
  if (normalized.includes('JARDIN')) return -2;
  if (normalized.includes('TRANSICION')) return 0;

  const namedGrades: Record<string, number> = {
    PRIMERO: 1,
    SEGUNDO: 2,
    TERCERO: 3,
    CUARTO: 4,
    QUINTO: 5,
    SEXTO: 6,
    SEPTIMO: 7,
    OCTAVO: 8,
    NOVENO: 9,
    DECIMO: 10,
    ONCE: 11,
  };
  const firstWord = normalized.split(' ')[0];
  return namedGrades[firstWord];
}

export function getTransportVeredas(): string[] {
  return [...new Set(TRANSPORT_ROUTES.map((route) => route.vereda))];
}

export function getTransportStopNames(vereda: string): string[] {
  const routes = TRANSPORT_ROUTES.filter((route) => route.vereda === vereda);
  const includedVeredas = routes.flatMap((route) => route.veredasIncluidas ?? []);
  return [
    ...new Set([
      ...routes.flatMap((route) => route.paraderos),
      ...TRANSPORT_ROUTES
        .filter((route) => includedVeredas.includes(route.vereda))
        .flatMap((route) => route.paraderos),
    ]),
  ];
}

export function getTransportDestinations(vereda: string, grade: string): string[] {
  const gradeCode = gradeCodeFromLabel(grade);
  if (gradeCode === undefined) return [];

  return [
    ...new Set(
      TRANSPORT_ROUTES
        .filter((route) => route.vereda === vereda && route.grados.includes(gradeCode))
        .map((route) => route.destino),
    ),
  ];
}
