import React from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { calculate1RMBrzycki } from '../../utils/mathFormulas';
import { Trash2, Trophy, Flame, AlertCircle, Dumbbell } from 'lucide-react';

export const SetHistoryList: React.FC = () => {
  const { currentExercise, setHistory, deleteSetRecord } = useWorkoutStore();

  const currentExerciseSets = setHistory.filter(
    (s) => s.id_ejercicio === currentExercise.id
  );

  if (currentExerciseSets.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500 space-y-2">
        <Dumbbell className="w-8 h-8 mx-auto stroke-1 opacity-50 text-slate-400" />
        <p className="text-sm font-medium text-slate-400">Sin series registradas para {currentExercise.nombre}</p>
        <p className="text-xs text-slate-500">Completa tu primera serie utilizando el panel superior.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Series Registradas</span>
          <span className="bg-slate-800 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono">
            {currentExerciseSets.length}
          </span>
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Volumen: {currentExerciseSets.reduce((acc, curr) => acc + (curr.peso_kg * curr.repeticiones), 0)} kg
        </span>
      </div>

      <div className="space-y-2.5">
        {currentExerciseSets.map((setRecord, idx) => {
          const est1RM = calculate1RMBrzycki(setRecord.peso_kg, setRecord.repeticiones);

          return (
            <div
              key={setRecord.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                setRecord.es_pr
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : setRecord.es_calentamiento
                  ? 'bg-slate-950/40 border-amber-500/30 opacity-80'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Set index & badges */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black font-mono text-slate-200">
                  #{setRecord.numero_serie || currentExerciseSets.length - idx}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-slate-100">
                      {setRecord.peso_kg} kg
                    </span>
                    <span className="text-xs text-slate-400 font-medium">×</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {setRecord.repeticiones} reps
                    </span>

                    {setRecord.es_pr && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Trophy className="w-3 h-3 fill-current" />
                        PR
                      </span>
                    )}

                    {setRecord.es_calentamiento && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" />
                        Calentamiento
                      </span>
                    )}

                    {setRecord.es_fallo && (
                      <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 font-semibold px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Fallo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <span>RIR {setRecord.rir} (RPE {setRecord.rpe})</span>
                    <span>•</span>
                    <span>1RM: {est1RM} kg</span>
                  </div>
                </div>
              </div>

              {/* Action delete */}
              <button
                onClick={() => deleteSetRecord(setRecord.id)}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                title="Eliminar serie"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
