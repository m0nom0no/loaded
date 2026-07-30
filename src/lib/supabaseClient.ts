import { createClient } from '@supabase/supabase-js';
import type { SetRecord, Exercise } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Inserts a new set record into Supabase PostgreSQL table 'historial_series'
 */
export async function syncSetToSupabase(setRecord: SetRecord) {
  if (!supabase) {
    console.log('[LOADED Engine] Supabase not connected. Set saved in local state/storage.');
    return { data: setRecord, error: null };
  }

  try {
    const { data, error } = await supabase.from('historial_series').insert([
      {
        id_sesion: setRecord.id_sesion,
        id_usuario: setRecord.id_usuario,
        id_ejercicio: setRecord.id_ejercicio,
        fecha: setRecord.fecha,
        numero_serie: setRecord.numero_serie,
        peso_kg: setRecord.peso_kg,
        repeticiones: setRecord.repeticiones,
        rir: setRecord.rir,
        es_calentamiento: setRecord.es_calentamiento,
        es_fallo: setRecord.es_fallo,
        es_pr: setRecord.es_pr,
        notas: setRecord.notas,
      },
    ]).select();

    return { data, error };
  } catch (err) {
    console.error('Error syncing set to Supabase:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetches exercises from Supabase PostgreSQL table 'ejercicios'
 */
export async function fetchSupabaseExercises(): Promise<Exercise[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('ejercicios').select('*');
    if (error || !data) return null;
    return data as Exercise[];
  } catch (err) {
    console.error('Error fetching exercises from Supabase:', err);
    return null;
  }
}
