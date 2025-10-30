-- ============================================
-- TABLAS DE RECURSOS
-- ============================================
-- Gestión de recursos de la empresa:
-- - Vehículos de la flota
-- - Operarios (conductores)
-- - Auxiliares
-- - Inspectores
-- ============================================

-- ============================================
-- TABLA: vehiculos
-- ============================================

CREATE TABLE IF NOT EXISTS public.vehiculos (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,

  -- Información del vehículo
  marca TEXT,
  modelo TEXT,
  tipo TEXT DEFAULT 'GRÚA PLATAFORMA',
  año INTEGER,
  color TEXT,
  vin TEXT,

  -- Estado
  activo BOOLEAN NOT NULL DEFAULT true,
  estado_operativo TEXT DEFAULT 'operativo'
    CHECK (estado_operativo IN ('operativo', 'mantenimiento', 'reparacion', 'inactivo')),

  -- Documentación
  soat_vencimiento DATE,
  tecnomecanica_vencimiento DATE,
  soat_aseguradora TEXT,
  numero_poliza_soat TEXT,

  -- Mantenimiento
  kilometraje_actual INTEGER,
  ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,

  -- Metadata
  observaciones TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID REFERENCES public.perfiles(id),
  actualizado_por UUID REFERENCES public.perfiles(id)
);

COMMENT ON TABLE public.vehiculos IS 'Flota de vehículos de la empresa';

CREATE INDEX idx_vehiculos_activos ON public.vehiculos(activo) WHERE activo = true;
CREATE INDEX idx_vehiculos_placa ON public.vehiculos(placa);
CREATE INDEX idx_vehiculos_soat_vencimiento ON public.vehiculos(soat_vencimiento);
CREATE INDEX idx_vehiculos_tecnomecanica_vencimiento ON public.vehiculos(tecnomecanica_vencimiento);
CREATE INDEX idx_vehiculos_estado_operativo ON public.vehiculos(estado_operativo);

-- ============================================
-- TABLA: operarios
-- ============================================

CREATE TABLE IF NOT EXISTS public.operarios (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cedula TEXT NOT NULL UNIQUE,

  -- Información personal
  telefono TEXT,
  direccion TEXT,
  correo_electronico TEXT,
  contacto_emergencia TEXT,
  telefono_emergencia TEXT,

  -- Estado laboral
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_ingreso DATE,
  fecha_retiro DATE,
  motivo_retiro TEXT,

  -- Información de conductor
  es_conductor BOOLEAN DEFAULT false,
  licencia_conduccion TEXT,
  categoria_licencia TEXT,
  licencia_vencimiento DATE,

  -- Salud y seguridad
  eps TEXT,
  arl TEXT,
  tipo_sangre TEXT,

  -- Metadata
  observaciones TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID REFERENCES public.perfiles(id),
  actualizado_por UUID REFERENCES public.perfiles(id)
);

COMMENT ON TABLE public.operarios IS 'Operarios y conductores de vehículos';

CREATE INDEX idx_operarios_activos ON public.operarios(activo) WHERE activo = true;
CREATE INDEX idx_operarios_cedula ON public.operarios(cedula);
CREATE INDEX idx_operarios_licencia_vencimiento ON public.operarios(licencia_vencimiento);
CREATE INDEX idx_operarios_nombre ON public.operarios(nombre);

-- ============================================
-- TABLA: auxiliares
-- ============================================

CREATE TABLE IF NOT EXISTS public.auxiliares (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cedula TEXT NOT NULL UNIQUE,

  -- Información personal
  telefono TEXT,
  direccion TEXT,
  correo_electronico TEXT,
  contacto_emergencia TEXT,
  telefono_emergencia TEXT,

  -- Estado laboral
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_ingreso DATE,
  fecha_retiro DATE,
  motivo_retiro TEXT,

  -- Salud y seguridad
  eps TEXT,
  arl TEXT,
  tipo_sangre TEXT,

  -- Metadata
  observaciones TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID REFERENCES public.perfiles(id),
  actualizado_por UUID REFERENCES public.perfiles(id)
);

COMMENT ON TABLE public.auxiliares IS 'Personal auxiliar de operaciones';

CREATE INDEX idx_auxiliares_activos ON public.auxiliares(activo) WHERE activo = true;
CREATE INDEX idx_auxiliares_cedula ON public.auxiliares(cedula);
CREATE INDEX idx_auxiliares_nombre ON public.auxiliares(nombre);

-- ============================================
-- TABLA: inspectores
-- ============================================

CREATE TABLE IF NOT EXISTS public.inspectores (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  documento TEXT NOT NULL UNIQUE,

  -- Información profesional
  cargo TEXT NOT NULL,
  certificaciones TEXT[],
  especialidades TEXT[],

  -- Contacto
  telefono TEXT,
  correo_electronico TEXT,

  -- Estado
  activo BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  observaciones TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creado_por UUID REFERENCES public.perfiles(id),
  actualizado_por UUID REFERENCES public.perfiles(id)
);

COMMENT ON TABLE public.inspectores IS 'Inspectores certificados para realizar inspecciones';

CREATE INDEX idx_inspectores_activos ON public.inspectores(activo) WHERE activo = true;
CREATE INDEX idx_inspectores_documento ON public.inspectores(documento);
CREATE INDEX idx_inspectores_nombre ON public.inspectores(nombre);

-- ============================================
-- TRIGGERS: actualizar updated_at
-- ============================================

CREATE TRIGGER trigger_vehiculos_actualizar_updated_at
  BEFORE UPDATE ON public.vehiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();

CREATE TRIGGER trigger_operarios_actualizar_updated_at
  BEFORE UPDATE ON public.operarios
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();

CREATE TRIGGER trigger_auxiliares_actualizar_updated_at
  BEFORE UPDATE ON public.auxiliares
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();

CREATE TRIGGER trigger_inspectores_actualizar_updated_at
  BEFORE UPDATE ON public.inspectores
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_updated_at();
