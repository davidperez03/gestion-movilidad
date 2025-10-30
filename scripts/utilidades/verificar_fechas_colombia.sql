-- ============================================
-- SCRIPT: Verificar fechas en zona horaria de Colombia
-- ============================================

-- 1. Mostrar hora actual del servidor vs hora de Colombia
SELECT
  'Hora del servidor (UTC)' as tipo,
  NOW() as fecha,
  EXTRACT(TIMEZONE FROM NOW())/3600 as offset_horas
UNION ALL
SELECT
  'Hora de Colombia (GMT-5)' as tipo,
  timezone('America/Bogota', NOW()) as fecha,
  -5 as offset_horas;

-- 2. Ver fechas de usuarios en UTC y en hora de Colombia
SELECT
  nombre_completo,
  correo,

  -- Fechas en UTC (como están guardadas)
  ultimo_acceso as ultimo_acceso_utc,
  creado_en as creado_en_utc,

  -- Fechas convertidas a hora de Colombia
  ultimo_acceso AT TIME ZONE 'America/Bogota' as ultimo_acceso_colombia,
  creado_en AT TIME ZONE 'America/Bogota' as creado_en_colombia,

  -- Diferencia en horas
  EXTRACT(EPOCH FROM (ultimo_acceso AT TIME ZONE 'America/Bogota' - ultimo_acceso))/3600 as diferencia_horas
FROM public.perfiles
ORDER BY creado_en DESC
LIMIT 5;

-- 3. Verificar usuarios bloqueados con hora de Colombia
SELECT
  nombre_completo,
  correo,
  intentos_login_fallidos,
  bloqueado_hasta AT TIME ZONE 'America/Bogota' as bloqueado_hasta_colombia,
  CASE
    WHEN bloqueado_hasta > NOW() THEN 'Bloqueado actualmente'
    WHEN bloqueado_hasta IS NOT NULL THEN 'Bloqueo expirado'
    ELSE 'No bloqueado'
  END as estado
FROM public.perfiles
WHERE bloqueado_hasta IS NOT NULL
ORDER BY bloqueado_hasta DESC;

-- 4. Función de ayuda: Obtener hora actual de Colombia
SELECT public.fecha_colombia() as hora_actual_colombia;
