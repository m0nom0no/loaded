export type EquipmentType = 'mancuernas' | 'barra' | 'poleas' | 'peso_corporal' | 'maquina';

export type MuscleGroup = 
  | 'Pecho' 
  | 'Espalda' 
  | 'Cuádriceps' 
  | 'Hombros' 
  | 'Tríceps' 
  | 'Bíceps' 
  | 'Glúteos' 
  | 'Abdomen';

export interface Gym {
  id: string;
  nombre: string;
  ciudad: string;
  descripcion: string;
}

export interface GymEquipment {
  id: string;
  id_gimnasio: string;
  tipo_equipamiento: EquipmentType;
  disponible: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  id_gimnasio_actual: string;
  unidad_peso: 'kg' | 'lbs';
}

export interface Exercise {
  id: string;
  nombre: string;
  grupo_muscular_principal: MuscleGroup;
  musculos_secundarios: string[];
  tipo_equipamiento: EquipmentType;
  patron_movimiento: string;
  factor_conversion_1rm: number;
  instruccion: string;
}

export interface SetRecord {
  id: string;
  id_sesion: string;
  id_usuario: string;
  id_ejercicio: string;
  fecha: string;
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
  rir: number; // 0 to 5
  rpe: number; // 10 - rir
  es_calentamiento: boolean;
  es_fallo: boolean;
  es_pr?: boolean;
  notas?: string;
}

export interface WorkoutSession {
  id: string;
  id_usuario: string;
  id_gimnasio: string;
  nombre_sesion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'en_proceso' | 'completado';
}

export interface SmartSwapRecommendation {
  exercise: Exercise;
  peso_sugerido_kg: number;
  explicacion_matematica: string;
  '1rm_historico_origen': number;
  tiene_historial_propio: boolean;
}
