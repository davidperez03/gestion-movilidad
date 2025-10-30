-- ============================================
-- DATOS DE PRUEBA - EVENTOS Y BITÁCORA
-- ============================================
-- Eventos de operación y cierres de ejemplo
-- NOTA: Requiere que existan vehículos y operarios
-- ============================================

-- ============================================
-- EVENTOS DE OPERACIÓN
-- ============================================

DO $$
DECLARE
  v_vehiculo_id UUID;
  v_operario_id UUID;
  v_auxiliar_id UUID;
  v_usuario_id UUID;
  fecha_evento DATE;
BEGIN
  -- Obtener IDs de prueba
  SELECT id INTO v_vehiculo_id FROM public.vehiculos WHERE placa = 'ABC123' LIMIT 1;
  SELECT id INTO v_operario_id FROM public.operarios WHERE cedula = '1234567890' LIMIT 1;
  SELECT id INTO v_auxiliar_id FROM public.auxiliares WHERE cedula = '2233445566' LIMIT 1;

  -- Usar un UUID genérico para creado_por (en producción será auth.uid())
  v_usuario_id := '00000000-0000-0000-0000-000000000000';

  -- Eventos de la última semana
  FOR i IN 0..6 LOOP
    fecha_evento := CURRENT_DATE - i;

    -- Evento de operación diurna
    INSERT INTO public.bitacora_eventos (
      vehiculo_id, operario_id, auxiliar_id,
      fecha, hora_inicio, hora_fin,
      tipo_evento, descripcion, turno,
      horas_operacion, kilometraje_inicio, kilometraje_fin,
      estado, creado_por
    ) VALUES (
      v_vehiculo_id, v_operario_id, v_auxiliar_id,
      fecha_evento, '06:00', '14:00',
      'operacion', 'Servicio de grúa - Turno diurno', 'diurno',
      8.0, 10000 + (i * 100), 10100 + (i * 100),
      'cerrado', v_usuario_id
    );

    -- Evento de operación nocturna (solo algunos días)
    IF i % 2 = 0 THEN
      INSERT INTO public.bitacora_eventos (
        vehiculo_id, operario_id, auxiliar_id,
        fecha, hora_inicio, hora_fin,
        tipo_evento, descripcion, turno,
        horas_operacion, kilometraje_inicio, kilometraje_fin,
        estado, creado_por
      ) VALUES (
        v_vehiculo_id, v_operario_id, v_auxiliar_id,
        fecha_evento, '18:00', '22:00',
        'operacion', 'Servicio de grúa - Turno nocturno', 'nocturno',
        4.0, 10100 + (i * 100), 10150 + (i * 100),
        'cerrado', v_usuario_id
      );
    END IF;
  END LOOP;

  -- Evento de mantenimiento
  INSERT INTO public.bitacora_eventos (
    vehiculo_id, operario_id,
    fecha, hora_inicio, hora_fin,
    tipo_evento, descripcion, turno,
    horas_operacion, estado, creado_por
  ) VALUES (
    v_vehiculo_id, v_operario_id,
    CURRENT_DATE - 3, '08:00', '12:00',
    'mantenimiento', 'Mantenimiento preventivo - Cambio de aceite y filtros', 'diurno',
    4.0, 'cerrado', v_usuario_id
  );

  -- Evento de falla (activo, sin cerrar)
  INSERT INTO public.bitacora_eventos (
    vehiculo_id, operario_id,
    fecha, hora_inicio,
    tipo_evento, descripcion,
    estado, creado_por,
    observaciones
  ) VALUES (
    v_vehiculo_id, v_operario_id,
    CURRENT_DATE, '10:00',
    'falla', 'Falla en sistema hidráulico',
    'activo', v_usuario_id,
    'Requiere revisión urgente. Sistema no levanta completamente.'
  );

  RAISE NOTICE 'Eventos de prueba creados para vehículo ABC123';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %. Asegúrate de ejecutar primero 01_datos_prueba_basicos.sql', SQLERRM;
END $$;

-- ============================================
-- EVENTOS PARA OTROS VEHÍCULOS
-- ============================================

DO $$
DECLARE
  v_vehiculo_id UUID;
  v_operario_id UUID;
  v_usuario_id UUID;
BEGIN
  SELECT id INTO v_vehiculo_id FROM public.vehiculos WHERE placa = 'DEF456' LIMIT 1;
  SELECT id INTO v_operario_id FROM public.operarios WHERE cedula = '9876543210' LIMIT 1;
  v_usuario_id := '00000000-0000-0000-0000-000000000000';

  -- Eventos de operación normal
  INSERT INTO public.bitacora_eventos (
    vehiculo_id, operario_id,
    fecha, hora_inicio, hora_fin,
    tipo_evento, descripcion, turno,
    horas_operacion, estado, creado_por
  ) VALUES
    (v_vehiculo_id, v_operario_id,
     CURRENT_DATE - 1, '07:00', '15:00',
     'operacion', 'Servicio de grúa', 'diurno',
     8.0, 'cerrado', v_usuario_id),

    (v_vehiculo_id, v_operario_id,
     CURRENT_DATE - 2, '07:00', '15:00',
     'operacion', 'Servicio de grúa', 'diurno',
     8.0, 'cerrado', v_usuario_id);

  RAISE NOTICE 'Eventos de prueba creados para vehículo DEF456';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creando eventos para DEF456: %', SQLERRM;
END $$;

-- ============================================
-- CIERRES DE BITÁCORA
-- ============================================

DO $$
DECLARE
  v_vehiculo_id UUID;
  v_operario_id UUID;
  v_usuario_id UUID;
  v_evento_ids UUID[];
BEGIN
  SELECT id INTO v_vehiculo_id FROM public.vehiculos WHERE placa = 'ABC123' LIMIT 1;
  SELECT id INTO v_operario_id FROM public.operarios WHERE cedula = '1234567890' LIMIT 1;
  v_usuario_id := '00000000-0000-0000-0000-000000000000';

  -- Obtener eventos cerrados de hace 2 días
  SELECT array_agg(id) INTO v_evento_ids
  FROM public.bitacora_eventos
  WHERE vehiculo_id = v_vehiculo_id
    AND fecha = CURRENT_DATE - 2
    AND estado = 'cerrado';

  -- Crear cierre solo si hay eventos
  IF array_length(v_evento_ids, 1) > 0 THEN
    INSERT INTO public.bitacora_cierres (
      vehiculo_id, operario_id,
      fecha_inicio, fecha_fin,
      hora_inicio, hora_fin,
      turno, horas_operacion, horas_novedades, horas_efectivas,
      eventos_ids, kilometraje_inicio, kilometraje_fin,
      cerrado_por, observaciones
    ) VALUES (
      v_vehiculo_id, v_operario_id,
      CURRENT_DATE - 2, CURRENT_DATE - 2,
      '06:00', '22:00',
      'completo', 12.0, 0.0, 12.0,
      v_evento_ids, 10200, 10350,
      v_usuario_id, 'Cierre de jornada completa - Sin novedades'
    );

    RAISE NOTICE 'Cierre de bitácora creado';
  ELSE
    RAISE NOTICE 'No se encontraron eventos para crear cierre';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creando cierre: %', SQLERRM;
END $$;

-- ============================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================

DO $$
DECLARE
  v_eventos INTEGER;
  v_cierres INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_eventos FROM public.bitacora_eventos;
  SELECT COUNT(*) INTO v_cierres FROM public.bitacora_cierres;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATOS DE BITÁCORA INSERTADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Eventos: %', v_eventos;
  RAISE NOTICE 'Cierres: %', v_cierres;
  RAISE NOTICE '========================================';
END $$;
