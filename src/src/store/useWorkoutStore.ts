import { create } from 'zustand';
import type { Exercise, Gym, GymEquipment, SetRecord, SmartSwapRecommendation } from '../types/database';
import { INITIAL_EXERCISES, INITIAL_GYMS, INITIAL_EQUIPMENT, INITIAL_SET_HISTORY } from '../data/mockDatabase';
import { calculate1RMBrzycki, calculateSuggestedWeight } from '../utils/mathFormulas';
import { syncSetToSupabase } from '../lib/supabaseClient';
import confetti from 'canvas-confetti';

interface WorkoutState {
  // Navigation & View
  activeTab: 'live' | 'swap' | 'dashboard';
  setActiveTab: (tab: 'live' | 'swap' | 'dashboard') => void;

  // Gym & Equipment
  gyms: Gym[];
  selectedGymId: string;
  equipment: GymEquipment[];
  setSelectedGymId: (gymId: string) => void;

  // Exercises
  exercises: Exercise[];
  currentExercise: Exercise;
  setCurrentExercise: (exercise: Exercise) => void;

  // Fast Return Cache (Original Exercise Cache)
  originalExerciseCache: Exercise | null;
  setOriginalExerciseCache: (exercise: Exercise | null) => void;
  revertToOriginal: () => void;

  // Sets History
  setHistory: SetRecord[];
  addSetRecord: (newSet: Omit<SetRecord, 'id' | 'id_sesion' | 'id_usuario' | 'fecha' | 'rpe' | 'es_pr'>) => SetRecord;
  deleteSetRecord: (id: string) => void;

  // Big Timer State
  timerSeconds: number;
  timerTarget: number;
  isTimerRunning: boolean;
  isTimerWarning: boolean;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  addTimerSeconds: (secondsToAdd: number) => void;
  tickTimer: () => void;

  // Smart Swap Modal & Logic
  isSmartSwapOpen: boolean;
  openSmartSwap: () => void;
  closeSmartSwap: () => void;
  getSmartSwapRecommendations: (filterEquipment?: string) => SmartSwapRecommendation[];
  performSmartSwap: (recommendation: SmartSwapRecommendation) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeTab: 'live',
  setActiveTab: (tab) => set({ activeTab: tab }),

  gyms: INITIAL_GYMS,
  selectedGymId: 'g1',
  equipment: INITIAL_EQUIPMENT,
  setSelectedGymId: (gymId) => set({ selectedGymId: gymId }),

  exercises: INITIAL_EXERCISES,
  currentExercise: INITIAL_EXERCISES[0],
  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

  originalExerciseCache: null,
  setOriginalExerciseCache: (exercise) => set({ originalExerciseCache: exercise }),

  revertToOriginal: () => {
    const { originalExerciseCache } = get();
    if (originalExerciseCache) {
      set({
        currentExercise: originalExerciseCache,
        originalExerciseCache: null,
      });
    }
  },

  setHistory: INITIAL_SET_HISTORY,

  addSetRecord: (newSetData) => {
    const { setHistory, currentExercise, startTimer } = get();
    
    // Calculate 1RM for this set
    const currentSet1RM = calculate1RMBrzycki(newSetData.peso_kg, newSetData.repeticiones);

    // Find highest historic 1RM for this exercise
    const previous1RMs = setHistory
      .filter(s => s.id_ejercicio === currentExercise.id && !s.es_calentamiento)
      .map(s => calculate1RMBrzycki(s.peso_kg, s.repeticiones));

    const maxPrevious1RM = previous1RMs.length > 0 ? Math.max(...previous1RMs) : 0;
    const isPR = !newSetData.es_calentamiento && currentSet1RM > maxPrevious1RM && currentSet1RM > 0;

    if (isPR) {
      // Trigger confetti celebration for PR!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        console.log('Confetti triggered', e);
      }
    }

    const createdSet: SetRecord = {
      ...newSetData,
      id: `s_${Date.now()}`,
      id_sesion: 'sess_live',
      id_usuario: 'u1',
      id_ejercicio: currentExercise.id,
      fecha: new Date().toISOString(),
      rpe: Math.max(5, Math.min(10, 10 - newSetData.rir)),
      es_pr: isPR,
    };

    set((state) => ({
      setHistory: [createdSet, ...state.setHistory],
    }));

    // Sync to Supabase in background
    syncSetToSupabase(createdSet);

    // Auto-start rest timer (90 seconds default)
    startTimer(90);

    return createdSet;
  },

  deleteSetRecord: (id) => {
    set((state) => ({
      setHistory: state.setHistory.filter((s) => s.id !== id),
    }));
  },

  // Big Timer implementation
  timerSeconds: 0,
  timerTarget: 90,
  isTimerRunning: false,
  isTimerWarning: false,

  startTimer: (seconds) => {
    set({
      timerSeconds: seconds,
      timerTarget: seconds,
      isTimerRunning: true,
      isTimerWarning: seconds <= 10 && seconds > 0,
    });
  },

  pauseTimer: () => set({ isTimerRunning: false }),
  resumeTimer: () => set((state) => ({ isTimerRunning: state.timerSeconds > 0 })),
  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false, isTimerWarning: false }),

  addTimerSeconds: (secs) => {
    set((state) => {
      const newSecs = Math.max(0, state.timerSeconds + secs);
      return {
        timerSeconds: newSecs,
        isTimerWarning: newSecs <= 10 && newSecs > 0,
      };
    });
  },

  tickTimer: () => {
    const { timerSeconds, isTimerRunning } = get();
    if (!isTimerRunning || timerSeconds <= 0) return;

    const nextSeconds = timerSeconds - 1;
    const isWarning = nextSeconds <= 10 && nextSeconds > 0;

    set({
      timerSeconds: nextSeconds,
      isTimerWarning: isWarning,
      isTimerRunning: nextSeconds > 0,
    });
  },

  // Smart Swap Modal logic
  isSmartSwapOpen: false,
  openSmartSwap: () => set({ isSmartSwapOpen: true }),
  closeSmartSwap: () => set({ isSmartSwapOpen: false }),

  getSmartSwapRecommendations: (filterEquipment) => {
    const { currentExercise, exercises, selectedGymId, equipment, setHistory } = get();

    // 1. Get available equipment types in active gym
    const availableEquipmentTypes = equipment
      .filter((eq) => eq.id_gimnasio === selectedGymId && eq.disponible)
      .map((eq) => eq.tipo_equipamiento);

    // 2. Find exercises with SAME primary muscle group, excluding current exercise
    let candidates = exercises.filter(
      (e) =>
        e.grupo_muscular_principal === currentExercise.grupo_muscular_principal &&
        e.id !== currentExercise.id &&
        availableEquipmentTypes.includes(e.tipo_equipamiento)
    );

    // Apply optional user equipment filter tab
    if (filterEquipment && filterEquipment !== 'todos') {
      candidates = candidates.filter((c) => c.tipo_equipamiento === filterEquipment);
    }

    // 3. Find highest historic 1RM for current exercise
    const currentExerciseSets = setHistory.filter((s) => s.id_ejercicio === currentExercise.id && !s.es_calentamiento);
    const max1RMCurrent = currentExerciseSets.length > 0
      ? Math.max(...currentExerciseSets.map((s) => calculate1RMBrzycki(s.peso_kg, s.repeticiones)))
      : 80; // Fallback baseline if no history yet

    // 4. Calculate deterministic recommendation per candidate
    return candidates.map((cand) => {
      // Check if user has personal set history for this alternative exercise
      const candSets = setHistory.filter((s) => s.id_ejercicio === cand.id && !s.es_calentamiento);
      const hasHistory = candSets.length > 0;

      let suggestedWeight = 0;
      let mathExplanation = '';

      if (hasHistory) {
        // If user already trained this exercise, base weight on their last session's 1RM!
        const max1RMCand = Math.max(...candSets.map((s) => calculate1RMBrzycki(s.peso_kg, s.repeticiones)));
        suggestedWeight = Math.round((max1RMCand * (1.0278 - 0.0278 * 8)) * 2) / 2;
        mathExplanation = `Basado en tu 1RM histórico de ${max1RMCand} kg registrado previamente en este ejercicio.`;
      } else {
        // Otherwise, convert 1RM deterministically using biomechanical ratios
        suggestedWeight = calculateSuggestedWeight(
          max1RMCurrent,
          8, // default 8 reps
          cand.factor_conversion_1rm,
          currentExercise.factor_conversion_1rm
        );
        mathExplanation = `Calculado determinísticamente a partir del 1RM de ${max1RMCurrent} kg en ${currentExercise.nombre} (Ratio biomecánico: ${(cand.factor_conversion_1rm / currentExercise.factor_conversion_1rm).toFixed(2)}x).`;
      }

      return {
        exercise: cand,
        peso_sugerido_kg: Math.max(2.5, suggestedWeight),
        explicacion_matematica: mathExplanation,
        '1rm_historico_origen': max1RMCurrent,
        tiene_historial_propio: hasHistory,
      };
    });
  },

  performSmartSwap: (recommendation) => {
    const { currentExercise, originalExerciseCache } = get();

    // Store original exercise in cache if not already set
    const newCache = originalExerciseCache ? originalExerciseCache : currentExercise;

    set({
      currentExercise: recommendation.exercise,
      originalExerciseCache: newCache,
      isSmartSwapOpen: false,
    });
  },
}));
