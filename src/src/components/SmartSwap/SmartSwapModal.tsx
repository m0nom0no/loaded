import { useState } from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { X, RefreshCw, Dumbbell, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const SmartSwapModal: React.FC = () => {
  const {
    isSmartSwapOpen,
    closeSmartSwap,
    currentExercise,
    getSmartSwapRecommendations,
    performSmartSwap,
  } = useWorkoutStore();

  const [equipmentFilter, setEquipmentFilter] = useState<string>('todos');

  if (!isSmartSwapOpen) return null;

  const recommendations = getSmartSwapRecommendations(equipmentFilter);

  const filterTabs: Array<{ id: string; label: string; icon: string }> = [
    { id: 'todos', label: 'Todos', icon: '⚡' },
    { id: 'mancuernas', label: 'Mancuernas', icon: '🏋️' },
    { id: 'poleas', label: 'Poleas', icon: '🪢' },
    { id: 'maquina', label: 'Máquinas', icon: '🤖' },
    { id: 'peso_corporal', label: 'Peso Corporal', icon: '🤸' },
    { id: 'barra', label: 'Barras', icon: '🏋️‍♂️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">Smart Swap (Máquina Ocupada)</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">
                  Determinista
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sustituye <strong className="text-emerald-400">{currentExercise.nombre}</strong> manteniendo el estímulo muscular de{' '}
                <strong className="text-cyan-400">{currentExercise.grupo_muscular_principal}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={closeSmartSwap}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment Filter Tabs */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto flex gap-2 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setEquipmentFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active-press ${
                equipmentFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Alternatives List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
              <Dumbbell className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                No se encontraron ejercicios alternativos con este filtro.
              </p>
              <p className="text-xs text-slate-500">
                Prueba a seleccionar la pestaña "Todos" o verifica la disponibilidad de equipamiento en tu gimnasio.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.exercise.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {rec.exercise.nombre}
                      </h3>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md uppercase">
                        {rec.exercise.tipo_equipamiento}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="text-cyan-400 font-medium">{rec.exercise.patron_movimiento}</span>
                      <span>•</span>
                      <span>Auxiliares: {rec.exercise.musculos_secundarios.join(', ')}</span>
                    </div>
                  </div>

                  {/* Suggested Weight Badge */}
                  <div className="text-right bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl shrink-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                      Peso Sugerido
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-300">
                      {rec.peso_sugerido_kg} kg
                    </span>
                  </div>
                </div>

                {/* Mathematical rationale explanation card */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {rec.explicacion_matematica}
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => performSmartSwap(rec)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl active-press transition flex items-center justify-center gap-2"
                >
                  <span>Sustituir por este Ejercicio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>LOADED almacena tu ejercicio original en caché para retornar en 1 solo clic.</span>
        </div>
      </div>
    </div>
  );
};
