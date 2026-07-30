import type { Exercise, Gym, GymEquipment, SetRecord, UserProfile } from '../types/database';

export const INITIAL_GYMS: Gym[] = [
  {
    id: 'g1',
    nombre: 'LOADED Training Club',
    ciudad: 'Madrid',
    descripcion: 'Gimnasio de alto rendimiento con zona de pesos libres, poleas y máquinas de palanca.',
  },
  {
    id: 'g2',
    nombre: 'Fitness Corner Express',
    ciudad: 'Barcelona',
    descripcion: 'Gimnasio urbano básico enfocado en mancuernas y peso corporal.',
  }
];

export const INITIAL_EQUIPMENT: GymEquipment[] = [
  { id: 'eq1', id_gimnasio: 'g1', tipo_equipamiento: 'barra', disponible: true },
  { id: 'eq2', id_gimnasio: 'g1', tipo_equipamiento: 'mancuernas', disponible: true },
  { id: 'eq3', id_gimnasio: 'g1', tipo_equipamiento: 'poleas', disponible: true },
  { id: 'eq4', id_gimnasio: 'g1', tipo_equipamiento: 'maquina', disponible: true },
  { id: 'eq5', id_gimnasio: 'g1', tipo_equipamiento: 'peso_corporal', disponible: true },

  // G2 missing heavy machinery
  { id: 'eq6', id_gimnasio: 'g2', tipo_equipamiento: 'mancuernas', disponible: true },
  { id: 'eq7', id_gimnasio: 'g2', tipo_equipamiento: 'peso_corporal', disponible: true },
  { id: 'eq8', id_gimnasio: 'g2', tipo_equipamiento: 'poleas', disponible: false },
];

export const INITIAL_USER: UserProfile = {
  id: 'u1',
  nombre: 'Alex Atleta',
  email: 'alex@loaded.app',
  id_gimnasio_actual: 'g1',
  unidad_peso: 'kg',
};

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'press_banca_barra',
    nombre: 'Press de Banca con Barra',
    grupo_muscular_principal: 'Pecho',
    musculos_secundarios: ['Tríceps', 'Deltoides Anterior'],
    tipo_equipamiento: 'barra',
    patron_movimiento: 'Empuje Horizontal',
    factor_conversion_1rm: 1.0,
    instruccion: 'Escápulas retraídas y deprimidas. Arqueo fisiológico natural, apoya los pies firmes y baja la barra a la parte media del pecho.',
  },
  {
    id: 'press_inclinado_mancuernas',
    nombre: 'Press Inclinado con Mancuernas',
    grupo_muscular_principal: 'Pecho',
    musculos_secundarios: ['Deltoides Anterior', 'Tríceps'],
    tipo_equipamiento: 'mancuernas',
    patron_movimiento: 'Empuje Horizontal',
    factor_conversion_1rm: 0.85,
    instruccion: 'Banco inclinado a 30°. Desciende con codos a 45° del cuerpo y empuja hacia el centro sin chocar las mancuernas.',
  },
  {
    id: 'cruce_poleas_pecho',
    nombre: 'Cruce de Poleas (Aperturas)',
    grupo_muscular_principal: 'Pecho',
    musculos_secundarios: ['Deltoides Anterior'],
    tipo_equipamiento: 'poleas',
    patron_movimiento: 'Empuje Horizontal',
    factor_conversion_1rm: 0.70,
    instruccion: 'Codos ligeramente flexionados. Junta las manos en frente del pecho apretando el pectoral 1 segundo.',
  },
  {
    id: 'flexiones_pecho',
    nombre: 'Flexiones de Pecho (Push-Ups)',
    grupo_muscular_principal: 'Pecho',
    musculos_secundarios: ['Tríceps', 'Core'],
    tipo_equipamiento: 'peso_corporal',
    patron_movimiento: 'Empuje Horizontal',
    factor_conversion_1rm: 0.65,
    instruccion: 'Cuerpo completamente alineado en plancha. Toca suavemente el suelo con el pecho en cada repetición.',
  },
  {
    id: 'press_maquina_pecho',
    nombre: 'Press de Pecho en Máquina',
    grupo_muscular_principal: 'Pecho',
    musculos_secundarios: ['Tríceps'],
    tipo_equipamiento: 'maquina',
    patron_movimiento: 'Empuje Horizontal',
    factor_conversion_1rm: 1.10,
    instruccion: 'Ajusta el asiento para que el agarre quede a nivel del pectoral medio. Empuja de forma guiada y controlada.',
  },

  // Espalda
  {
    id: 'jalon_polea_pecho',
    nombre: 'Jalón al Pecho en Polea Alta',
    grupo_muscular_principal: 'Espalda',
    musculos_secundarios: ['Bíceps', 'Deltoides Posterior'],
    tipo_equipamiento: 'poleas',
    patron_movimiento: 'Tracción Vertical',
    factor_conversion_1rm: 0.90,
    instruccion: 'Agarre amplio prono. Tira de la barra hacia la clavícula sacando el pecho.',
  },
  {
    id: 'remo_barra',
    nombre: 'Remo con Barra 45°',
    grupo_muscular_principal: 'Espalda',
    musculos_secundarios: ['Bíceps', 'Zona Lumbar'],
    tipo_equipamiento: 'barra',
    patron_movimiento: 'Tracción Horizontal',
    factor_conversion_1rm: 1.0,
    instruccion: 'Flexión de cadera con espalda recta. Lleva la barra a la parte baja del abdomen.',
  },
  {
    id: 'dominadas',
    nombre: 'Dominadas Pronas',
    grupo_muscular_principal: 'Espalda',
    musculos_secundarios: ['Bíceps', 'Core'],
    tipo_equipamiento: 'peso_corporal',
    patron_movimiento: 'Tracción Vertical',
    factor_conversion_1rm: 1.0,
    instruccion: 'Eleva el cuerpo hasta pasar el mentón sobre la barra sin balanceo.',
  },
  {
    id: 'remo_mancuerna_unilateral',
    nombre: 'Remo Unilateral con Mancuerna',
    grupo_muscular_principal: 'Espalda',
    musculos_secundarios: ['Bíceps'],
    tipo_equipamiento: 'mancuernas',
    patron_movimiento: 'Tracción Horizontal',
    factor_conversion_1rm: 0.85,
    instruccion: 'Apoya una mano y rodilla en el banco. Tira de la mancuerna hacia la cadera.',
  },

  // Cuádriceps
  {
    id: 'sentadilla_trasera_barra',
    nombre: 'Sentadilla Trasera con Barra',
    grupo_muscular_principal: 'Cuádriceps',
    musculos_secundarios: ['Glúteos', 'Lumbares'],
    tipo_equipamiento: 'barra',
    patron_movimiento: 'Dominante de Rodilla',
    factor_conversion_1rm: 1.0,
    instruccion: 'Barra sobre trapecios. Desciende rompiendo el paralelo con rodillas alineadas a los pies.',
  },
  {
    id: 'prensa_45_maquina',
    nombre: 'Prensa de Piernas 45°',
    grupo_muscular_principal: 'Cuádriceps',
    musculos_secundarios: ['Glúteos'],
    tipo_equipamiento: 'maquina',
    patron_movimiento: 'Dominante de Rodilla',
    factor_conversion_1rm: 1.45,
    instruccion: 'Pies a la anchura de hombros. Empuja con los talones sin hiperextender rodillas.',
  },
  {
    id: 'zancadas_mancuernas',
    nombre: 'Zancadas con Mancuernas',
    grupo_muscular_principal: 'Cuádriceps',
    musculos_secundarios: ['Glúteos'],
    tipo_equipamiento: 'mancuernas',
    patron_movimiento: 'Dominante de Rodilla',
    factor_conversion_1rm: 0.75,
    instruccion: 'Pasos largos manteniendo el torso erguido. La rodilla trasera casi roza el suelo.',
  },

  // Hombros
  {
    id: 'press_militar_mancuernas',
    nombre: 'Press Militar con Mancuernas',
    grupo_muscular_principal: 'Hombros',
    musculos_secundarios: ['Tríceps'],
    tipo_equipamiento: 'mancuernas',
    patron_movimiento: 'Empuje Vertical',
    factor_conversion_1rm: 0.80,
    instruccion: 'Empuja verticalmente desde los hombros hasta extender los brazos sobre la cabeza.',
  },
  {
    id: 'elevaciones_laterales_polea',
    nombre: 'Elevaciones Laterales en Polea',
    grupo_muscular_principal: 'Hombros',
    musculos_secundarios: ['Trapecio'],
    tipo_equipamiento: 'poleas',
    patron_movimiento: 'Aislamiento',
    factor_conversion_1rm: 0.40,
    instruccion: 'Polea baja. Eleva el brazo lateralmente hasta la altura del hombro con tensión constante.',
  }
];

// Helper to generate past dates
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_SET_HISTORY: SetRecord[] = [
  // Session 1 - 21 days ago
  { id: 's1', id_sesion: 'sess1', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(21), numero_serie: 1, peso_kg: 70, repeticiones: 10, rir: 2, rpe: 8, es_calentamiento: false, es_fallo: false },
  { id: 's2', id_sesion: 'sess1', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(21), numero_serie: 2, peso_kg: 75, repeticiones: 8, rir: 1, rpe: 9, es_calentamiento: false, es_fallo: false },
  { id: 's3', id_sesion: 'sess1', id_usuario: 'u1', id_ejercicio: 'jalon_polea_pecho', fecha: daysAgo(21), numero_serie: 1, peso_kg: 55, repeticiones: 12, rir: 2, rpe: 8, es_calentamiento: false, es_fallo: false },

  // Session 2 - 14 days ago
  { id: 's4', id_sesion: 'sess2', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(14), numero_serie: 1, peso_kg: 80, repeticiones: 7, rir: 1, rpe: 9, es_calentamiento: false, es_fallo: false },
  { id: 's5', id_sesion: 'sess2', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(14), numero_serie: 2, peso_kg: 82.5, repeticiones: 6, rir: 0, rpe: 10, es_calentamiento: false, es_fallo: true },
  { id: 's6', id_sesion: 'sess2', id_usuario: 'u1', id_ejercicio: 'press_inclinado_mancuernas', fecha: daysAgo(14), numero_serie: 1, peso_kg: 30, repeticiones: 10, rir: 2, rpe: 8, es_calentamiento: false, es_fallo: false },

  // Session 3 - 7 days ago
  { id: 's7', id_sesion: 'sess3', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(7), numero_serie: 1, peso_kg: 85, repeticiones: 6, rir: 1, rpe: 9, es_calentamiento: false, es_fallo: false },
  { id: 's8', id_sesion: 'sess3', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(7), numero_serie: 2, peso_kg: 87.5, repeticiones: 5, rir: 0, rpe: 10, es_calentamiento: false, es_fallo: false, es_pr: true },
  { id: 's9', id_sesion: 'sess3', id_usuario: 'u1', id_ejercicio: 'sentadilla_trasera_barra', fecha: daysAgo(7), numero_serie: 1, peso_kg: 100, repeticiones: 8, rir: 2, rpe: 8, es_calentamiento: false, es_fallo: false },
  { id: 's10', id_sesion: 'sess3', id_usuario: 'u1', id_ejercicio: 'sentadilla_trasera_barra', fecha: daysAgo(7), numero_serie: 2, peso_kg: 105, repeticiones: 6, rir: 1, rpe: 9, es_calentamiento: false, es_fallo: false },

  // Session Today
  { id: 's11', id_sesion: 'sess4', id_usuario: 'u1', id_ejercicio: 'press_banca_barra', fecha: daysAgo(0), numero_serie: 1, peso_kg: 90, repeticiones: 6, rir: 1, rpe: 9, es_calentamiento: false, es_fallo: false, es_pr: true },
];
