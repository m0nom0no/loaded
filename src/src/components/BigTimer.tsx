import { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { playTimerWarningBeep, playTimerFinishChime } from '../utils/audioAlert';
import { Play, Pause, RotateCcw, Plus, Clock, Zap, Volume2, VolumeX } from 'lucide-react';

export const BigTimer: React.FC = () => {
  const {
    timerSeconds,
    timerTarget,
    isTimerRunning,
    isTimerWarning,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addTimerSeconds,
    tickTimer,
  } = useWorkoutStore();

  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Timer interval effect & audio triggers
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, tickTimer]);

  // Audio trigger effect on timer state change
  useEffect(() => {
    if (!isMuted && isTimerRunning) {
      if (timerSeconds === 10 || (timerSeconds <= 3 && timerSeconds > 0)) {
        playTimerWarningBeep();
      }
    }

    if (!isMuted && timerSeconds === 0 && isTimerRunning) {
      playTimerFinishChime();
      resetTimer();
    }
  }, [timerSeconds, isTimerRunning, isMuted, resetTimer]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = timerTarget > 0 ? Math.min(100, Math.max(0, (timerSeconds / timerTarget) * 100)) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-500 shadow-xl ${
        isTimerWarning
          ? 'timer-warning-pulse border-red-500/80 bg-red-950/40 text-red-100'
          : isTimerRunning
          ? 'bg-slate-900/90 border-emerald-500/40 text-slate-100 shadow-emerald-950/20'
          : 'bg-slate-900/60 border-slate-800 text-slate-300'
      }`}
    >
      {/* Background progress bar indicator */}
      <div
        className={`absolute bottom-0 left-0 top-0 opacity-15 transition-all duration-300 pointer-events-none ${
          isTimerWarning ? 'bg-red-500' : 'bg-emerald-500'
        }`}
        style={{ width: `${progressPercentage}%` }}
      />

      <div className="relative z-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Left info label */}
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              isTimerWarning
                ? 'bg-red-500/20 text-red-400 animate-bounce'
                : isTimerRunning
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isTimerWarning ? <Zap className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Temporizador de Descanso
              </span>
              {isTimerWarning && (
                <span className="text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
                  ¡10s restantes!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isTimerRunning ? 'Descanso activo en curso' : 'Listo para registrar tu descanso'}
            </p>
          </div>
        </div>

        {/* Big Timer Display */}
        <div className="flex items-baseline gap-1 font-mono tracking-tighter">
          <span
            className={`text-5xl font-black transition-colors ${
              isTimerWarning
                ? 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                : isTimerRunning
                ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-slate-200'
            }`}
          >
            {formatTime(timerSeconds)}
          </span>
          <span className="text-xs text-slate-500 font-sans font-medium">s</span>
        </div>

        {/* Quick Actions & Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Mute Audio Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-slate-800 border-slate-700 text-emerald-400'
            }`}
            title={isMuted ? 'Sonido Silenciado' : 'Sonido Activado'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick preset buttons */}
          <div className="flex gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => startTimer(60)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active-press transition"
            >
              60s
            </button>
            <button
              onClick={() => startTimer(90)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active-press transition"
            >
              90s
            </button>
            <button
              onClick={() => startTimer(120)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active-press transition"
            >
              2m
            </button>
          </div>

          {/* Plus 30s */}
          <button
            onClick={() => addTimerSeconds(30)}
            title="Añadir 30s"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl active-press transition border border-slate-700 flex items-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>30s</span>
          </button>

          {/* Play / Pause Toggle */}
          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl active-press transition shadow-lg shadow-amber-500/20"
              title="Pausar"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={timerSeconds > 0 ? resumeTimer : () => startTimer(90)}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl active-press transition shadow-lg shadow-emerald-500/20"
              title="Iniciar"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
          )}

          {/* Reset */}
          <button
            onClick={resetTimer}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl active-press transition border border-slate-700"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
