import { useWorkoutStore } from '../../store/useWorkoutStore';
import { BigTimer } from '../BigTimer';
import { QuickInputSet } from './QuickInputSet';
import { SetHistoryList } from './SetHistoryList';
import { SmartSwapModal } from '../SmartSwap/SmartSwapModal';
import { RefreshCw, RotateCcw, Info, Sparkles, Building2 } from 'lucide-react';

export const LiveWorkoutView: React.FC = () => {
  const {
    currentExercise,
    setCurrentExercise,
    exercises,
    originalExerciseCache,
    revertToOriginal,
    openSmartSwap,
    selectedGymId,
    gyms,
    setSelectedGymId,
  } = useWorkoutStore();

  const currentGym = gyms.find((g) => g.id === selectedGymId) || gyms[0];

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Gym Location & Selector Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Gimnasio Activo:</span>
          <strong className="text-slate-200">{currentGym.nombre} ({currentGym.ciudad})</strong>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-medium">Cambiar Sede:</label>
          <select
            value={selectedGymId}
            onChange={(e) => setSelectedGymId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fast Return Banner (Zustand Cache Alert) */}
      {originalExerciseCache && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Estás realizando un ejercicio alternativo
              </p>
              <p className="text-xs text-slate-300">
                Ejercicio original guardado en memoria: <strong className="text-white">{originalExerciseCache.nombre}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={revertToOriginal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md active-press transition flex items-center gap-2 shrink-0 uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Volver al Original</span>
          </button>
        </div>
      )}

      {/* Current Exercise Header Card & Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                {currentExercise.grupo_muscular_principal}
              </span>
              <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-full text-xs uppercase">
                {currentExercise.tipo_equipamiento}
              </span>
              <span className="bg-slate-800 text-cyan-400 font-medium px-2.5 py-1 rounded-full text-xs">
                {currentExercise.patron_movimiento}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Exercise Selector dropdown */}
              <select
                value={currentExercise.id}
                onChange={(e) => {
                  const found = exercises.find((ex) => ex.id === e.target.value);
                  if (found) setCurrentExercise(found);
                }}
                className="bg-slate-950 text-2xl font-black text-slate-100 border border-slate-800 rounded-2xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 max-w-full"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nombre} ({ex.grupo_muscular_principal})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart Swap Button */}
          <button
            onClick={openSmartSwap}
            className="py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/10 active-press transition flex items-center justify-center gap-2 uppercase tracking-wider shrink-0"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            <span>Máquina Ocupada (Smart Swap)</span>
          </button>
        </div>

        {/* Biomechanical Instruction */}
        {currentExercise.instruccion && (
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{currentExercise.instruccion}</p>
          </div>
        )}
      </div>

      {/* Integrated Big Timer */}
      <BigTimer />

      {/* Quick Input Set Component */}
      <QuickInputSet />

      {/* Set History List Component */}
      <SetHistoryList />

      {/* Smart Swap Modal */}
      <SmartSwapModal />
    </div>
  );
};
