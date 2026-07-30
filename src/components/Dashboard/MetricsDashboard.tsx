import React, { useState } from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { calculate1RMBrzycki, calculate1RMEpley, calculateTotalVolume } from '../../utils/mathFormulas';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart2, Award, Dumbbell, Zap, Flame, Calendar } from 'lucide-react';

export const MetricsDashboard: React.FC = () => {
  const { exercises, setHistory, currentExercise } = useWorkoutStore();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(currentExercise.id);
  const [formulaType, setFormulaType] = useState<'brzycki' | 'epley'>('brzycki');

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  // 1. Calculate 1RM Progression Data Points over time for selected exercise
  const exerciseSets = setHistory
    .filter((s) => s.id_ejercicio === selectedExerciseId && !s.es_calentamiento)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Group sets by date to get max 1RM for each workout date
  const dateMap: { [dateStr: string]: { date: string; max1RM: number; peso: number; reps: number; isPR: boolean } } = {};

  exerciseSets.forEach((s) => {
    const dateFormatted = new Date(s.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });

    const est1RM = formulaType === 'brzycki'
      ? calculate1RMBrzycki(s.peso_kg, s.repeticiones)
      : calculate1RMEpley(s.peso_kg, s.repeticiones);

    if (!dateMap[dateFormatted] || est1RM > dateMap[dateFormatted].max1RM) {
      dateMap[dateFormatted] = {
        date: dateFormatted,
        max1RM: est1RM,
        peso: s.peso_kg,
        reps: s.repeticiones,
        isPR: !!s.es_pr,
      };
    }
  });

  const chartData = Object.values(dateMap);

  // 2. Volume Breakdown by Muscle Group
  const muscleVolumeMap: { [muscle: string]: number } = {
    Pecho: 0,
    Espalda: 0,
    Cuádriceps: 0,
    Hombros: 0,
  };

  setHistory.forEach((s) => {
    if (s.es_calentamiento) return;
    const ex = exercises.find((e) => e.id === s.id_ejercicio);
    if (ex) {
      const vol = s.peso_kg * s.repeticiones;
      const group = ex.grupo_muscular_principal;
      muscleVolumeMap[group] = (muscleVolumeMap[group] || 0) + vol;
    }
  });

  const muscleVolumeData = Object.keys(muscleVolumeMap).map((m) => ({
    muscle: m,
    volume: muscleVolumeMap[m],
  }));

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Total session volume today
  const todayVolume = calculateTotalVolume(setHistory);

  // All-time highest 1RM for selected exercise
  const allTimeBest1RM = chartData.length > 0 ? Math.max(...chartData.map((d) => d.max1RM)) : 0;

  // Average RIR
  const validRirSets = setHistory.filter((s) => !s.es_calentamiento);
  const avgRir = validRirSets.length > 0
    ? (validRirSets.reduce((acc, curr) => acc + curr.rir, 0) / validRirSets.length).toFixed(1)
    : '2.0';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volumen Acumulado</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{todayVolume.toLocaleString()} <span className="text-xs text-slate-500 font-sans font-normal">kg</span></p>
          <span className="text-[10px] text-slate-500 block">Series × Reps × Peso</span>
        </div>

        {/* Max 1RM */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mejor 1RM ({selectedExercise.nombre.slice(0, 10)}...)</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-mono text-cyan-400">{allTimeBest1RM} <span className="text-xs text-slate-500 font-sans font-normal">kg</span></p>
          <span className="text-[10px] text-slate-500 block">Fórmula de {formulaType.toUpperCase()}</span>
        </div>

        {/* Total Series */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Series Totales</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{setHistory.length}</p>
          <span className="text-[10px] text-slate-500 block">Efectivas + Calentamiento</span>
        </div>

        {/* Avg RIR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">RIR Promedio</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black font-mono text-purple-400">{avgRir}</p>
          <span className="text-[10px] text-slate-500 block">Intensidad (RPE {(10 - parseFloat(avgRir)).toFixed(1)})</span>
        </div>
      </div>

      {/* 1RM Progression Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-slate-100">Progresión Matemática de 1RM Estimado</h2>
            </div>
            <p className="text-xs text-slate-400">
              Evolución determinista basada en el rendimiento real de tus series.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Exercise selector for chart */}
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nombre}
                </option>
              ))}
            </select>

            {/* Formula toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                onClick={() => setFormulaType('brzycki')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  formulaType === 'brzycki'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Brzycki
              </button>
              <button
                onClick={() => setFormulaType('epley')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  formulaType === 'epley'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Epley
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="h-72 w-full pt-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Sin datos suficientes para este ejercicio. Registra series en Vivo.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono">
                          <p className="text-slate-400 flex items-center gap-1 font-sans">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{data.date}</span>
                          </p>
                          <p className="text-emerald-400 font-bold text-sm">
                            1RM Estimado: {data.max1RM} kg
                          </p>
                          <p className="text-slate-300">
                            Serie: {data.peso} kg × {data.reps} reps
                          </p>
                          {data.isPR && (
                            <span className="inline-block bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase font-sans">
                              Record Personal (PR)
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="max1RM"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#10b981', stroke: '#022c22', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#34d399', stroke: '#064e3b', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Volume by Muscle Group Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-black text-slate-100">Distribución de Volumen por Grupo Muscular</h3>
            <p className="text-xs text-slate-400">Total de kilogramos movilizados por grupo muscular principal.</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={muscleVolumeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="muscle" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-cyan-400 font-bold">
                        {data.muscle}: {data.volume.toLocaleString()} kg movilizados
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="volume" radius={[8, 8, 0, 0]}>
                {muscleVolumeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
