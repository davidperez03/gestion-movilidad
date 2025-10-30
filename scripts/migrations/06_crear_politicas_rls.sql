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
ALTER TABLE public.operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auxiliares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitacora_cierres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_inspeccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_inspeccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_acciones ENABLE ROW LEVEL SECURITY;

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
-- POLÍTICAS: operarios
-- ============================================

-- Todos pueden ver operarios activos
CREATE POLICY "Todos pueden ver operarios activos"
  ON public.operarios FOR SELECT
  USING (activo = true OR public.es_administrador());

-- Solo administradores pueden gestionar operarios
CREATE POLICY "Solo administradores pueden gestionar operarios"
  ON public.operarios FOR ALL
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: auxiliares
-- ============================================

-- Todos pueden ver auxiliares activos
CREATE POLICY "Todos pueden ver auxiliares activos"
  ON public.auxiliares FOR SELECT
  USING (activo = true OR public.es_administrador());

-- Solo administradores pueden gestionar auxiliares
CREATE POLICY "Solo administradores pueden gestionar auxiliares"
  ON public.auxiliares FOR ALL
  USING (public.es_administrador());

-- ============================================
-- POLÍTICAS: inspectores
-- ============================================

-- Todos pueden ver inspectores activos
CREATE POLICY "Todos pueden ver inspectores activos"
  ON public.inspectores FOR SELECT
  USING (activo = true OR public.es_administrador());

-- Solo administradores pueden gestionar inspectores
CREATE POLICY "Solo administradores pueden gestionar inspectores"
  ON public.inspectores FOR ALL
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
-- POLÍTICAS: bitacora_cierres
-- ============================================

-- Todos pueden ver cierres
CREATE POLICY "Todos pueden ver cierres"
  ON public.bitacora_cierres FOR SELECT
  TO authenticated
  USING (true);

-- Inspectores y administradores pueden crear cierres
CREATE POLICY "Inspectores pueden crear cierres"
  ON public.bitacora_cierres FOR INSERT
  TO authenticated
  WITH CHECK (public.es_inspector_o_superior());

-- Solo administradores pueden modificar cierres
CREATE POLICY "Solo administradores pueden modificar cierres"
  ON public.bitacora_cierres FOR UPDATE
  USING (public.es_administrador());

-- Solo administradores pueden eliminar cierres
CREATE POLICY "Solo administradores pueden eliminar cierres"
  ON public.bitacora_cierres FOR DELETE
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
-- POLÍTICAS: historial_personal
-- ============================================

-- Todos pueden ver historial de personal
CREATE POLICY "Todos pueden ver historial de personal"
  ON public.historial_personal FOR SELECT
  TO authenticated
  USING (true);

-- Solo el sistema puede insertar en historial (via triggers)
-- No hay políticas de INSERT/UPDATE/DELETE para usuarios

-- ============================================
-- POLÍTICAS: historial_acciones
-- ============================================

-- Solo administradores pueden ver historial de acciones
CREATE POLICY "Solo administradores pueden ver historial"
  ON public.historial_acciones FOR SELECT
  USING (public.es_administrador());

-- Los usuarios pueden ver sus propias acciones
CREATE POLICY "Usuarios pueden ver sus propias acciones"
  ON public.historial_acciones FOR SELECT
  USING (usuario_id = auth.uid());

-- Solo el sistema puede insertar en historial (via triggers)
-- No hay políticas de INSERT/UPDATE/DELETE para usuarios

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
