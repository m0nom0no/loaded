import React, { useState } from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { calculate1RMBrzycki } from '../../utils/mathFormulas';
import { Plus, Minus, CheckCircle, Flame, AlertCircle } from 'lucide-react';

export const QuickInputSet: React.FC = () => {
  const { currentExercise, setHistory, addSetRecord } = useWorkoutStore();

  // Find last set logged for this exercise to prefill sensible defaults
  const exerciseSets = setHistory.filter((s) => s.id_ejercicio === currentExercise.id);
  const lastSet = exerciseSets.length > 0 ? exerciseSets[0] : null;

  const [weight, setWeight] = useState<number>(lastSet ? lastSet.peso_kg : 60);
  const [reps, setReps] = useState<number>(lastSet ? lastSet.repeticiones : 10);
  const [rir, setRir] = useState<number>(2); // Default RIR 2
  const [isWarmup, setIsWarmup] = useState<boolean>(false);
  const [isFailure, setIsFailure] = useState<boolean>(false);

  // Sync state if current exercise changes
  React.useEffect(() => {
    const recent = setHistory.find((s) => s.id_ejercicio === currentExercise.id);
    if (recent) {
      setWeight(recent.peso_kg);
      setReps(recent.repeticiones);
    } else {
      setWeight(currentExercise.tipo_equipamiento === 'peso_corporal' ? 0 : 40);
      setReps(10);
    }
  }, [currentExercise.id, setHistory]);

  const current1RM = calculate1RMBrzycki(weight, reps);
  const nextSetNumber = exerciseSets.filter(s => s.id_sesion === 'sess_live').length + 1;

  const handleWeightChange = (delta: number) => {
    setWeight((prev) => Math.max(0, Math.round((prev + delta) * 2) / 2));
  };

  const handleRepsChange = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSetRecord({
      id_ejercicio: currentExercise.id,
      numero_serie: nextSetNumber,
      peso_kg: weight,
      repeticiones: reps,
      rir: isFailure ? 0 : rir,
      es_calentamiento: isWarmup,
      es_fallo: isFailure,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            Serie #{nextSetNumber}
          </span>
          {isWarmup && (
            <span className="bg-amber-500/20 text-amber-400 font-medium px-2.5 py-0.5 rounded-full text-xs">
              Calentamiento
            </span>
          )}
          {isFailure && (
            <span className="bg-red-500/20 text-red-400 font-medium px-2.5 py-0.5 rounded-full text-xs">
              Al Fallo (RIR 0)
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">1RM Estimado</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {current1RM > 0 ? `${current1RM} kg` : '0 kg'}
          </span>
        </div>
      </div>

      {/* Inputs Grid: Large Touch Controls for Weight & Reps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PESO (KG) CONTROL */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Peso Levantado (KG)
          </span>

          <div className="flex items-center justify-between w-full gap-2 my-1">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleWeightChange(-5)}
                className="w-10 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-200 font-black text-sm rounded-xl border border-slate-700 transition"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleWeightChange(-1)}
                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-100 font-black text-lg rounded-xl border border-slate-700 transition flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-baseline gap-1 text-center font-mono">
              <input
                type="number"
                step="0.5"
                min="0"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 text-center text-4xl font-black bg-transparent text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg"
              />
              <span className="text-xs text-slate-500 font-sans">kg</span>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleWeightChange(1)}
                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-100 font-black text-lg rounded-xl border border-slate-700 transition flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleWeightChange(5)}
                className="w-10 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-200 font-black text-sm rounded-xl border border-slate-700 transition"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        {/* REPETICIONES CONTROL */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Repeticiones Conseguidas
          </span>

          <div className="flex items-center justify-between w-full gap-2 my-1">
            <button
              type="button"
              onClick={() => handleRepsChange(-1)}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-100 font-black text-xl rounded-xl border border-slate-700 transition flex items-center justify-center"
            >
              <Minus className="w-6 h-6" />
            </button>

            <div className="flex items-baseline gap-1 text-center font-mono">
              <input
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-4xl font-black bg-transparent text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg"
              />
              <span className="text-xs text-slate-500 font-sans">reps</span>
            </div>

            <button
              type="button"
              onClick={() => handleRepsChange(1)}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active-press text-slate-100 font-black text-xl rounded-xl border border-slate-700 transition flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* RIR / RPE SELECTION & SET TYPE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>RIR (Repeticiones en Recámara)</span>
            <span className="text-[10px] text-slate-500 font-normal">(RPE {(10 - rir).toFixed(1)})</span>
          </label>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((rVal) => (
            <button
              key={rVal}
              type="button"
              onClick={() => {
                setRir(rVal);
                if (rVal === 0) setIsFailure(true);
                else setIsFailure(false);
              }}
              className={`py-3 rounded-xl border text-sm font-bold transition-all active-press flex flex-col items-center justify-center ${
                rir === rVal && !isWarmup
                  ? rVal === 0
                    ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                    : 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{rVal === 0 ? 'Fallo' : `RIR ${rVal}`}</span>
              <span className="text-[10px] opacity-70">RPE {10 - rVal}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes Options */}
      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isWarmup}
            onChange={(e) => setIsWarmup(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Serie de Calentamiento</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isFailure}
            onChange={(e) => {
              setIsFailure(e.target.checked);
              if (e.target.checked) setRir(0);
            }}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500"
          />
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>Llegada al Fallo Técnico</span>
        </label>
      </div>

      {/* Main Submit Button */}
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 active-press transition flex items-center justify-center gap-3 uppercase tracking-wider"
      >
        <CheckCircle className="w-6 h-6 stroke-[2.5]" />
        <span>Registrar Serie ({weight} kg × {reps} reps)</span>
      </button>
    </form>
  );
};
