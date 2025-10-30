-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================
-- Row Level Security para control de acceso
-- Roles: administrador, inspector, usuario
-- ============================================

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_operativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_inspeccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_inspeccion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.obtener_rol_usuario()
RETURNS TEXT AS $$
  SELECT rol FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Verificar si el usuario es inspector o superior
CREATE OR REPLACE FUNCTION public.es_inspector_o_superior()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid()
      AND rol IN ('inspector', 'administrador')
      AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS: perfiles
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Administradores pueden ver todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (public.es_administrador());

-- Los usuarios pueden actualizar su propio perfil (campos limitados)
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND rol = (SELECT rol FROM public.perfiles WHERE id = auth.uid())
  );

-- Solo administradores pueden modificar roles y crear usuarios
CREATE POLICY "Solo administradores pueden gestionar usuarios"
  ON public.perfiles FOR ALL
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: vehiculos
-- ============================================

-- Todos los usuarios autenticados pueden ver vehículos activos
CREATE POLICY "Todos pueden ver vehículos activos"
  ON public.vehiculos FOR SELECT
  USING (activo = true OR public.es_administrador());

-- Solo administradores pueden crear/modificar/eliminar vehículos
CREATE POLICY "Solo administradores pueden gestionar vehículos"
  ON public.vehiculos FOR ALL
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: roles_operativos
-- ============================================

-- Todos pueden ver roles operativos activos
CREATE POLICY "Todos pueden ver roles operativos activos"
  ON public.roles_operativos FOR SELECT
  USING (activo = true OR public.es_administrador());

-- Los usuarios pueden ver sus propios roles (incluso inactivos)
CREATE POLICY "Usuarios pueden ver sus propios roles"
  ON public.roles_operativos FOR SELECT
  USING (perfil_id = auth.uid());

-- Solo administradores pueden crear roles operativos
CREATE POLICY "Solo administradores pueden crear roles operativos"
  ON public.roles_operativos FOR INSERT
  WITH CHECK (public.es_administrador());

-- Solo administradores pueden actualizar roles operativos
CREATE POLICY "Solo administradores pueden actualizar roles operativos"
  ON public.roles_operativos FOR UPDATE
  USING (public.es_administrador());

-- Solo administradores pueden eliminar roles operativos
CREATE POLICY "Solo administradores pueden eliminar roles operativos"
  ON public.roles_operativos FOR DELETE
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: bitacora_eventos
-- ============================================

-- Todos pueden ver eventos
CREATE POLICY "Todos pueden ver eventos"
  ON public.bitacora_eventos FOR SELECT
  TO authenticated
  USING (true);

-- Inspectores y administradores pueden crear eventos
CREATE POLICY "Inspectores pueden crear eventos"
  ON public.bitacora_eventos FOR INSERT
  TO authenticated
  WITH CHECK (public.es_inspector_o_superior());

-- Solo el creador o administrador puede actualizar eventos activos
CREATE POLICY "Creador puede actualizar sus eventos activos"
  ON public.bitacora_eventos FOR UPDATE
  USING (
    estado = 'activo'
    AND (creado_por = auth.uid() OR public.es_administrador())
  );

-- Solo administradores pueden eliminar eventos
CREATE POLICY "Solo administradores pueden eliminar eventos"
  ON public.bitacora_eventos FOR DELETE
  USING (public.es_administrador());


-- ============================================
-- POLÍTICAS: inspecciones
-- ============================================

-- Todos pueden ver inspecciones
CREATE POLICY "Todos pueden ver inspecciones"
  ON public.inspecciones FOR SELECT
  TO authenticated
  USING (true);

-- Inspectores y administradores pueden crear inspecciones
CREATE POLICY "Inspectores pueden crear inspecciones"
  ON public.inspecciones FOR INSERT
  TO authenticated
  WITH CHECK (public.es_inspector_o_superior());

-- Solo el creador o administrador puede actualizar inspecciones en borrador
CREATE POLICY "Creador puede actualizar inspecciones en borrador"
  ON public.inspecciones FOR UPDATE
  USING (
    (estado = 'borrador' AND creado_por = auth.uid())
    OR public.es_administrador()
  );

-- Solo administradores pueden eliminar inspecciones
CREATE POLICY "Solo administradores pueden eliminar inspecciones"
  ON public.inspecciones FOR DELETE
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: items_inspeccion
-- ============================================

-- Todos pueden ver items de inspección
CREATE POLICY "Todos pueden ver items de inspección"
  ON public.items_inspeccion FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspecciones
      WHERE id = inspeccion_id
    )
  );

-- Se pueden insertar items si el usuario puede modificar la inspección
CREATE POLICY "Insertar items si puede modificar inspección"
  ON public.items_inspeccion FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspecciones
      WHERE id = inspeccion_id
        AND (
          (estado = 'borrador' AND creado_por = auth.uid())
          OR public.es_administrador()
        )
    )
  );

-- Se pueden actualizar items si el usuario puede modificar la inspección
CREATE POLICY "Actualizar items si puede modificar inspección"
  ON public.items_inspeccion FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspecciones
      WHERE id = inspeccion_id
        AND (
          (estado = 'borrador' AND creado_por = auth.uid())
          OR public.es_administrador()
        )
    )
  );

-- Solo administradores pueden eliminar items
CREATE POLICY "Solo administradores pueden eliminar items"
  ON public.items_inspeccion FOR DELETE
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: fotos_inspeccion
-- ============================================

-- Todos pueden ver fotos
CREATE POLICY "Todos pueden ver fotos de inspección"
  ON public.fotos_inspeccion FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspecciones
      WHERE id = inspeccion_id
    )
  );

-- Se pueden subir fotos si el usuario puede modificar la inspección
CREATE POLICY "Subir fotos si puede modificar inspección"
  ON public.fotos_inspeccion FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspecciones
      WHERE id = inspeccion_id
        AND (
          (estado = 'borrador' AND creado_por = auth.uid())
          OR public.es_administrador()
        )
    )
  );

-- Solo administradores pueden eliminar fotos
CREATE POLICY "Solo administradores pueden eliminar fotos"
  ON public.fotos_inspeccion FOR DELETE
  USING (public.es_administrador());


-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Permisos básicos para usuarios autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Los usuarios anónimos no tienen permisos
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
