-- ============================================
-- TABLAS DE BITÁCORA
-- ============================================
-- Registro de eventos y cierres de operación
-- ============================================

-- ============================================
-- TABLA: bitacora_eventos
-- ============================================

CREATE TABLE IF NOT EXISTS public.bitacora_eventos (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id),
  operario_id UUID REFERENCES public.operarios(id),
  auxiliar_id UUID REFERENCES public.auxiliares(id),

  -- Fecha y hora
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,

  -- Tipo de evento
  tipo_evento TEXT NOT NULL
    CHECK (tipo_evento IN ('operacion', 'mantenimiento', 'falla', 'inactivo', 'traslado')),
  descripcion TEXT NOT NULL,

  -- Turno
  turno TEXT CHECK (turno IN ('diurno', 'nocturno', 'completo')),

  -- Métricas
  horas_operacion NUMERIC(5,2),
  kilometraje_inicio INTEGER,
  kilometraje_fin INTEGER,
  combustible_inicial NUMERIC(5,2),
  combustible_final NUMERIC(5,2),

  -- Estado
  estado TEXT NOT NULL DEFAULT 'activo'
    CHECK (estado IN ('activo', 'cerrado', 'cancelado')),

  -- Ubicación
  ubicacion_inicio TEXT,
  ubicacion_fin TEXT,
  coordenadas_inicio POINT,
  coordenadas_fin POINT,

  -- Metadata
  observaciones TEXT,
  adjuntos TEXT[],
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID NOT NULL REFERENCES public.perfiles(id),
  actualizado_por UUID REFERENCES public.perfiles(id)
);

COMMENT ON TABLE public.bitacora_eventos IS
  'Eventos de operación diaria de vehículos';

COMMENT ON COLUMN public.bitacora_eventos.tipo_evento IS
  'Tipo de evento: operacion (trabajo normal), mantenimiento, falla, inactivo, traslado';

-- Índices
CREATE INDEX idx_eventos_vehiculo_fecha ON public.bitacora_eventos(vehiculo_id, fecha DESC);
CREATE INDEX idx_eventos_estado ON public.bitacora_eventos(estado);
CREATE INDEX idx_eventos_fecha ON public.bitacora_eventos(fecha DESC);
CREATE INDEX idx_eventos_operario ON public.bitacora_eventos(operario_id);
CREATE INDEX idx_eventos_tipo ON public.bitacora_eventos(tipo_evento);

-- ============================================
-- TABLA: bitacora_cierres
-- ============================================

CREATE TABLE IF NOT EXISTS public.bitacora_cierres (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id),
  operario_id UUID REFERENCES public.operarios(id),

  -- Período
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  turno TEXT CHECK (turno IN ('diurno', 'nocturno', 'mixto')),

  -- Métricas calculadas
  horas_operacion NUMERIC(5,2) NOT NULL DEFAULT 0,
  horas_novedades NUMERIC(5,2) NOT NULL DEFAULT 0,
  horas_efectivas NUMERIC(5,2) NOT NULL DEFAULT 0,
  porcentaje_efectividad NUMERIC(5,2),

  -- Kilometraje y combustible
  kilometraje_inicio INTEGER,
  kilometraje_fin INTEGER,
  kilometros_recorridos INTEGER,
  combustible_consumido NUMERIC(6,2),
  rendimiento_combustible NUMERIC(5,2),

  -- Eventos relacionados
  eventos_ids UUID[] NOT NULL DEFAULT '{}',
  cantidad_eventos INTEGER DEFAULT 0,

  -- Metadata
  observaciones TEXT,
  cerrado_por UUID NOT NULL REFERENCES public.perfiles(id),
  cerrado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.bitacora_cierres IS
  'Cierres de períodos de operación con métricas consolidadas';

COMMENT ON COLUMN public.bitacora_cierres.horas_efectivas IS
  'Horas de operación real descontando novedades';

COMMENT ON COLUMN public.bitacora_cierres.porcentaje_efectividad IS
  'Porcentaje de efectividad = (horas_efectivas / horas_operacion) * 100';

-- Índices
CREATE INDEX idx_cierres_vehiculo_fecha ON public.bitacora_cierres(vehiculo_id, fecha_inicio DESC);
CREATE INDEX idx_cierres_fecha_inicio ON public.bitacora_cierres(fecha_inicio DESC);
CREATE INDEX idx_cierres_operario ON public.bitacora_cierres(operario_id);

-- ============================================
-- FUNCIÓN: calcular métricas de cierre
-- ============================================

CREATE OR REPLACE FUNCTION public.calcular_metricas_cierre()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular kilómetros recorridos
  IF NEW.kilometraje_inicio IS NOT NULL AND NEW.kilometraje_fin IS NOT NULL THEN
    NEW.kilometros_recorridos = NEW.kilometraje_fin - NEW.kilometraje_inicio;
  END IF;

  -- Calcular rendimiento de combustible
  IF NEW.combustible_consumido IS NOT NULL AND NEW.combustible_consumido > 0
     AND NEW.kilometros_recorridos IS NOT NULL THEN
    NEW.rendimiento_combustible = NEW.kilometros_recorridos / NEW.combustible_consumido;
  END IF;

  -- Calcular porcentaje de efectividad
  IF NEW.horas_operacion > 0 THEN
    NEW.porcentaje_efectividad = (NEW.horas_efectivas / NEW.horas_operacion) * 100;
  END IF;

  -- Contar eventos
  NEW.cantidad_eventos = array_length(NEW.eventos_ids, 1);
  IF NEW.cantidad_eventos IS NULL THEN
    NEW.cantidad_eventos = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_metricas_cierre
  BEFORE INSERT OR UPDATE ON public.bitacora_cierres
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_metricas_cierre();

-- ============================================
-- TRIGGERS: actualizar updated_at
-- ============================================

CREATE TRIGGER trigger_eventos_actualizar_updated_at
  BEFORE UPDATE ON public.bitacora_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();

CREATE TRIGGER trigger_cierres_actualizar_updated_at
  BEFORE UPDATE ON public.bitacora_cierres
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();
