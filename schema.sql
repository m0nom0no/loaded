-- ============================================================================
-- BASE DE DATOS: LOADED (Gym Workout & Mathematical Progression Tracker)
-- Motor: PostgreSQL / Supabase Relacional
-- Restricción: Lógica determinista sin APIs de IA
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: GIMNASIOS
CREATE TABLE IF NOT EXISTS gimnasios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100),
    descripcion TEXT,
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: EQUIPAMIENTO_GIMNASIO
-- Define qué equipamiento está disponible en cada gimnasio específico
CREATE TABLE IF NOT EXISTS equipamiento_gimnasio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_gimnasio UUID REFERENCES gimnasios(id) ON DELETE CASCADE,
    tipo_equipamiento VARCHAR(50) NOT NULL, -- 'mancuernas', 'barra', 'poleas', 'peso_corporal', 'maquina'
    disponible BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_gimnasio_equipamiento UNIQUE (id_gimnasio, tipo_equipamiento)
);

-- 4. TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    id_gimnasio_actual UUID REFERENCES gimnasios(id) ON DELETE SET NULL,
    unidad_peso VARCHAR(10) DEFAULT 'kg',
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: EJERCICIOS (Con Metadatos Biomecánicos)
CREATE TABLE IF NOT EXISTS ejercicios (
    id VARCHAR(50) PRIMARY KEY, -- ej: 'press_banca_barra', 'press_inclinado_mancuernas'
    nombre VARCHAR(100) NOT NULL,
    grupo_muscular_principal VARCHAR(50) NOT NULL, -- 'Pecho', 'Espalda', 'Cuádriceps', 'Hombros', 'Tríceps', 'Bíceps', etc.
    musculos_secundarios TEXT[], -- Array de músculos auxiliares ej: ARRAY['Tríceps', 'Hombro Anterior']
    tipo_equipamiento VARCHAR(50) NOT NULL, -- 'mancuernas', 'barra', 'poleas', 'peso_corporal', 'maquina'
    patron_movimiento VARCHAR(50) NOT NULL, -- 'Empuje Horizontal', 'Tracción Vertical', 'Dominante de Rodilla', etc.
    factor_conversion_1rm NUMERIC(4,2) DEFAULT 1.0, -- Factor biomecánico para estimación relativa de fuerza
    instruccion TEXT
);

-- 6. TABLA: SESIONES_ENTRENAMIENTO
CREATE TABLE IF NOT EXISTS sesiones_entrenamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    id_gimnasio UUID REFERENCES gimnasios(id) ON DELETE SET NULL,
    nombre_sesion VARCHAR(100) DEFAULT 'Sesión de Entrenamiento',
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'en_proceso' -- 'en_proceso', 'completado'
);

-- 7. TABLA: HISTORIAL_SERIES (Progreso Matemático de Series)
CREATE TABLE IF NOT EXISTS historial_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_sesion UUID REFERENCES sesiones_entrenamiento(id) ON DELETE CASCADE,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    id_ejercicio VARCHAR(50) REFERENCES ejercicios(id) ON DELETE RESTRICT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    numero_serie INT NOT NULL CHECK (numero_serie > 0),
    peso_kg NUMERIC(6,2) NOT NULL CHECK (peso_kg >= 0),
    repeticiones INT NOT NULL CHECK (repeticiones > 0),
    rir INT DEFAULT 2 CHECK (rir >= 0 AND rir <= 5), -- Reps in Reserve (Repeticiones en recámara)
    rpe NUMERIC(3,1) GENERATED ALWAYS AS (10.0 - rir) STORED, -- Rating of Perceived Exertion (Calculado)
    es_calentamiento BOOLEAN DEFAULT FALSE,
    es_fallo BOOLEAN DEFAULT FALSE,
    es_pr BOOLEAN DEFAULT FALSE, -- Record Personal registrado
    notas TEXT,
    creado_el TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXACIÓN PARA RENDIMIENTO DE CONSULTAS EN VIVO Y GRÁFICOS
CREATE INDEX IF NOT EXISTS idx_historial_usuario_ejercicio ON historial_series (id_usuario, id_ejercicio, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ejercicios_grupo_equipamiento ON ejercicios (grupo_muscular_principal, tipo_equipamiento);

-- ============================================================================
-- FUNCIONES MATEMÁTICAS Y LÓGICA DETERMINISTA EN SQL
-- ============================================================================

-- A. FÓRMULA DE BRZYCKI PARA 1RM ESTIMADO: 1RM = Peso / (1.0278 - 0.0278 * Reps)
CREATE OR REPLACE FUNCTION calcular_1rm_brzycki(p_peso NUMERIC, p_reps INT)
RETURNS NUMERIC AS $$
BEGIN
    IF p_reps <= 0 THEN
        RETURN 0;
    ELSIF p_reps = 1 THEN
        RETURN p_peso;
    ELSIF p_reps >= 37 THEN
        -- Límite de la fórmula de Brzycki
        RETURN ROUND(p_peso * 1.5, 2);
    ELSE
        RETURN ROUND(p_peso / (1.0278 - (0.0278 * p_reps)), 2);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- B. BÚSQUEDA DETERMINISTA "SMART SWAP" (MÁQUINA OCUPADA)
-- Encuentra ejercicios alternativos que trabajen el MISMO grupo muscular principal
-- y que estén disponibles en el equipamiento del gimnasio seleccionado.
CREATE OR REPLACE FUNCTION buscar_ejercicios_alternativos(
    p_id_ejercicio_actual VARCHAR(50),
    p_id_gimnasio UUID,
    p_filtro_equipamiento VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    id_ejercicio VARCHAR(50),
    nombre VARCHAR(100),
    grupo_muscular_principal VARCHAR(50),
    tipo_equipamiento VARCHAR(50),
    patron_movimiento VARCHAR(50),
    factor_conversion NUMERIC(4,2)
) AS $$
DECLARE
    v_grupo_muscular VARCHAR(50);
BEGIN
    -- Obtener el grupo muscular principal del ejercicio actual
    SELECT grupo_muscular_principal INTO v_grupo_muscular
    FROM ejercicios
    WHERE id = p_id_ejercicio_actual;

    RETURN QUERY
    SELECT 
        e.id,
        e.nombre,
        e.grupo_muscular_principal,
        e.tipo_equipamiento,
        e.patron_movimiento,
        e.factor_conversion_1rm
    FROM ejercicios e
    INNER JOIN equipamiento_gimnasio eg ON eg.tipo_equipamiento = e.tipo_equipamiento
    WHERE e.grupo_muscular_principal = v_grupo_muscular
      AND e.id <> p_id_ejercicio_actual
      AND eg.id_gimnasio = p_id_gimnasio
      AND eg.disponible = TRUE
      AND (p_filtro_equipamiento IS NULL OR p_filtro_equipamiento = '' OR e.tipo_equipamiento = p_filtro_equipamiento);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SEMILLA DE DATOS DE PRUEBA (SEED DATA)
-- ============================================================================

-- Insertar Gimnasio de Prueba
INSERT INTO gimnasios (id, nombre, ciudad, descripcion) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'LOADED Training Club', 'Madrid', 'Gimnasio de alto rendimiento equipado');

-- Insertar Equipamiento del Gimnasio
INSERT INTO equipamiento_gimnasio (id_gimnasio, tipo_equipamiento, disponible) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'mancuernas', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'barra', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'poleas', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'peso_corporal', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'maquina', TRUE);

-- Insertar Usuario de Prueba
INSERT INTO usuarios (id, email, nombre, id_gimnasio_actual) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'alex.atleta@loaded.app', 'Alex Pro', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insertar Catálogo Biomecánico de Ejercicios
INSERT INTO ejercicios (id, nombre, grupo_muscular_principal, musculos_secundarios, tipo_equipamiento, patron_movimiento, factor_conversion_1rm, instruccion) VALUES
('press_banca_barra', 'Press de Banca con Barra', 'Pecho', ARRAY['Tríceps', 'Deltoides Anterior'], 'barra', 'Empuje Horizontal', 1.00, 'Mantén 3 puntos de apoyo, escápulas retraídas y baja la barra a la parte media del pecho.'),
('press_inclinado_mancuernas', 'Press Inclinado con Mancuernas', 'Pecho', ARRAY['Deltoides Anterior', 'Tríceps'], 'mancuernas', 'Empuje Horizontal', 0.85, 'Banco a 30 grados. Baja las mancuernas con codos a 45 grados respecto al torso.'),
('cruce_poleas_pecho', 'Cruce de Poleas para Pecho', 'Pecho', ARRAY['Deltoides Anterior'], 'poleas', 'Empuje Horizontal', 0.70, 'Mantén ligera flexión de codos y aprieta en el punto de máxima contracción.'),
('flexiones_pecho', 'Flexiones de Pecho (Push-Ups)', 'Pecho', ARRAY['Tríceps', 'Core'], 'peso_corporal', 'Empuje Horizontal', 0.65, 'Cuerpo en plancha rígida, baja hasta rozar el suelo con el pecho.'),
('press_maquina_pecho', 'Press de Pecho en Máquina Convergente', 'Pecho', ARRAY['Tríceps'], 'maquina', 'Empuje Horizontal', 1.10, 'Ajusta el asiento para que los agarres queden a la altura del pecho medio.'),

('jalon_polea_pecho', 'Jalón al Pecho en Polea', 'Espalda', ARRAY['Bíceps', 'Deltoides Posterior'], 'poleas', 'Tracción Vertical', 0.90, 'Agarre prono más ancho que hombros. Lleva la barra hacia la parte superior del pecho.'),
('remo_barra', 'Remo con Barra Horizontal', 'Espalda', ARRAY['Bíceps', 'Lumbares'], 'barra', 'Tracción Horizontal', 1.00, 'Torso inclinado 45°, tracciona la barra hacia el ombligo manteniendo la columna neutra.'),
('dominadas', 'Dominadas Pronas (Pull-Ups)', 'Espalda', ARRAY['Bíceps', 'Core'], 'peso_corporal', 'Tracción Vertical', 1.00, 'Cuélgate con brazos extendidos y eleva el mentón por encima de la barra.'),
('remo_mancuerna_unilateral', 'Remo Unilateral con Mancuerna', 'Espalda', ARRAY['Bíceps'], 'mancuernas', 'Tracción Horizontal', 0.85, 'Apoya una rodilla en el banco, tracciona el peso hacia la cadera.'),

('sentadilla_trasera_barra', 'Sentadilla Trasera con Barra', 'Cuádriceps', ARRAY['Glúteos', 'Lumbares'], 'barra', 'Dominante de Rodilla', 1.00, 'Barra sobre trapecios, rompe el paralelo bajando con codos alineados.'),
('prensa_45_maquina', 'Prensa de Piernas 45°', 'Cuádriceps', ARRAY['Glúteos'], 'maquina', 'Dominante de Rodilla', 1.40, 'Pies a la anchura de hombros, no bloquees completamente las rodillas en la extensión.'),
('sentadilla_zancadas_mancuernas', 'Zancadas Caminando con Mancuernas', 'Cuádriceps', ARRAY['Glúteos', 'Isquiotibiales'], 'mancuernas', 'Dominante de Rodilla', 0.75, 'Pasos firmes manteniendo el torso erguido.'),

('press_militar_mancuernas', 'Press Militar de Hombros con Mancuernas', 'Hombros', ARRAY['Tríceps'], 'mancuernas', 'Empuje Vertical', 0.80, 'Sentado a 85°, empuja verticalmente hasta casi juntar las mancuernas.'),
('elevaciones_laterales_polea', 'Elevaciones Laterales en Polea', 'Hombros', ARRAY['Trapecio'], 'poleas', 'Aislamiento', 0.40, 'Polea a la altura de la rodilla, eleva el brazo hasta la paralela con el suelo.');

-- Insertar Historial Semilla de Series (Progresión en el tiempo para visualización de gráficos)
INSERT INTO sesiones_entrenamiento (id, id_usuario, id_gimnasio, nombre_sesion, fecha_inicio, estado) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Torso Fuerza - Semana 1', NOW() - INTERVAL '21 days', 'completado'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Torso Fuerza - Semana 2', NOW() - INTERVAL '14 days', 'completado'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Torso Hipertrofia - Semana 3', NOW() - INTERVAL '7 days', 'completado'),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Torso Record - Hoy', NOW(), 'en_proceso');

-- Series registradas para el gráfico de 1RM acumulado
INSERT INTO historial_series (id_sesion, id_usuario, id_ejercicio, fecha, numero_serie, peso_kg, repeticiones, rir, es_pr) VALUES
-- Press Banca Hace 21 días (1RM est ~90kg)
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '21 days', 1, 70.0, 10, 2, FALSE),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '21 days', 2, 75.0, 8, 1, FALSE),

-- Press Banca Hace 14 días (1RM est ~96kg)
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '14 days', 1, 80.0, 7, 1, FALSE),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '14 days', 2, 82.5, 6, 0, FALSE),

-- Press Banca Hace 7 días (1RM est ~101kg)
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '7 days', 1, 85.0, 6, 1, FALSE),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW() - INTERVAL '7 days', 2, 87.5, 5, 0, TRUE),

-- Press Banca Sesión de Hoy (1RM est ~107kg PR!)
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW(), 1, 90.0, 6, 1, TRUE),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_banca_barra', NOW(), 2, 92.5, 5, 0, TRUE),

-- Ejercicio alternativo (Press Inclinado Mancuernas)
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_inclinado_mancuernas', NOW() - INTERVAL '14 days', 1, 30.0, 10, 2, FALSE),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'press_inclinado_mancuernas', NOW() - INTERVAL '7 days', 1, 32.0, 8, 1, FALSE);
