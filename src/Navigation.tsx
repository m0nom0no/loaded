import { useWorkoutStore } from './store/useWorkoutStore';
import { Activity, BarChart2, Database, RefreshCw, Zap, RotateCcw } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, originalExerciseCache, revertToOriginal, openSmartSwap } = useWorkoutStore();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-current" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
                  LOADED
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Guiado de Entrenamiento & Progresión Matemática
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            {originalExerciseCache && (
              <button
                onClick={revertToOriginal}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl active-press transition flex items-center gap-1.5"
                title="Volver al ejercicio original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver a {originalExerciseCache.nombre.slice(0, 12)}...</span>
                <span className="sm:hidden">Original</span>
              </button>
            )}

            <button
              onClick={openSmartSwap}
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 active-press transition flex items-center gap-1.5"
              title="Máquina Ocupada"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Smart Swap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all active-press ${
              activeTab === 'live'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">En Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all active-press ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all active-press ${
              activeTab === 'sql'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">Esquema SQL</span>
          </button>
        </div>
      </nav>
    </>
  );
};
