import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ============================================================================
-- BASE DE DATOS: LOADED (Gym Workout & Mathematical Progression Tracker)
-- Motor: PostgreSQL / Supabase Relacional
-- Restricción: Lógica determinista sin APIs de IA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: GIMNASIOS
CREATE TABLE IF NOT EXISTS gimnasios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100),
    descripcion TEXT,
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: EQUIPAMIENTO_GIMNASIO
CREATE TABLE IF NOT EXISTS equipamiento_gimnasio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_gimnasio UUID REFERENCES gimnasios(id) ON DELETE CASCADE,
    tipo_equipamiento VARCHAR(50) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_gimnasio_equipamiento UNIQUE (id_gimnasio, tipo_equipamiento)
);

-- 3. TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    id_gimnasio_actual UUID REFERENCES gimnasios(id) ON DELETE SET NULL,
    unidad_peso VARCHAR(10) DEFAULT 'kg',
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: EJERCICIOS (Con Metadatos Biomecánicos)
CREATE TABLE IF NOT EXISTS ejercicios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    grupo_muscular_principal VARCHAR(50) NOT NULL,
    musculos_secundarios TEXT[],
    tipo_equipamiento VARCHAR(50) NOT NULL,
    patron_movimiento VARCHAR(50) NOT NULL,
    factor_conversion_1rm NUMERIC(4,2) DEFAULT 1.0,
    instruccion TEXT
);

-- 5. TABLA: HISTORIAL_SERIES (Progreso Matemático)
CREATE TABLE IF NOT EXISTS historial_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_sesion UUID REFERENCES sesiones_entrenamiento(id) ON DELETE CASCADE,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    id_ejercicio VARCHAR(50) REFERENCES ejercicios(id) ON DELETE RESTRICT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    numero_serie INT NOT NULL CHECK (numero_serie > 0),
    peso_kg NUMERIC(6,2) NOT NULL CHECK (peso_kg >= 0),
    repeticiones INT NOT NULL CHECK (repeticiones > 0),
    rir INT DEFAULT 2 CHECK (rir >= 0 AND rir <= 5),
    rpe NUMERIC(3,1) GENERATED ALWAYS AS (10.0 - rir) STORED,
    es_calentamiento BOOLEAN DEFAULT FALSE,
    es_fallo BOOLEAN DEFAULT FALSE,
    es_pr BOOLEAN DEFAULT FALSE,
    notas TEXT,
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- FÓRMULA DE BRZYCKI PARA 1RM ESTIMADO EN SQL
CREATE OR REPLACE FUNCTION calcular_1rm_brzycki(p_peso NUMERIC, p_reps INT)
RETURNS NUMERIC AS $$
BEGIN
    IF p_reps <= 0 THEN RETURN 0;
    ELSIF p_reps = 1 THEN RETURN p_peso;
    ELSE RETURN ROUND(p_peso / (1.0278 - (0.0278 * p_reps)), 2);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">Esquema Relacional SQL (Supabase / PostgreSQL)</h2>
              <p className="text-xs text-slate-400">
                Estructura DDL completa con metadatos biomecánicos, funciones deterministas e indexado.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 active-press transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar SQL Completo'}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>schema.sql</span>
          </div>
          <pre>{sqlCode}</pre>
        </div>

        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-xs text-slate-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>
            Este esquema está listo para ser ejecutado en el <strong>SQL Editor</strong> de Supabase o cualquier base de datos PostgreSQL 14+.
          </p>
        </div>
      </div>
    </div>
  );
};
