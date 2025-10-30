-- ============================================
-- SCRIPT: Desbloquear todos los usuarios
-- ============================================
-- Este script elimina todos los bloqueos de usuarios
-- y resetea los intentos de login fallidos
-- ============================================

-- Opción 1: Desbloquear TODOS los usuarios
UPDATE public.perfiles
SET
  bloqueado_hasta = NULL,
  intentos_login_fallidos = 0,
  actualizado_en = NOW()
WHERE bloqueado_hasta IS NOT NULL
  OR intentos_login_fallidos > 0;

-- Opción 2: Desbloquear un usuario específico por correo
-- Descomenta y reemplaza 'usuario@ejemplo.com' con el correo real
/*
UPDATE public.perfiles
SET
  bloqueado_hasta = NULL,
  intentos_login_fallidos = 0,
  actualizado_en = NOW()
WHERE correo = 'usuario@ejemplo.com';
*/

-- Opción 3: Desbloquear solo usuarios cuyo bloqueo ya expiró
-- (esto debería ser automático pero por si acaso)
/*
UPDATE public.perfiles
SET
  bloqueado_hasta = NULL,
  actualizado_en = NOW()
WHERE bloqueado_hasta IS NOT NULL
  AND bloqueado_hasta < NOW();
*/

-- Opción 4: Ver usuarios actualmente bloqueados
/*
SELECT
  correo,
  nombre_completo,
  intentos_login_fallidos,
  bloqueado_hasta,
  CASE
    WHEN bloqueado_hasta > NOW() THEN 'Bloqueado'
    WHEN bloqueado_hasta <= NOW() THEN 'Bloqueo expirado'
    ELSE 'No bloqueado'
  END as estado_bloqueo
FROM public.perfiles
WHERE bloqueado_hasta IS NOT NULL
ORDER BY bloqueado_hasta DESC;
*/

-- Mostrar resultados
SELECT
  COUNT(*) as usuarios_desbloqueados
FROM public.perfiles
WHERE bloqueado_hasta IS NULL
  AND intentos_login_fallidos = 0;

COMMENT ON COLUMN public.perfiles.bloqueado_hasta IS
  'Fecha hasta la cual el usuario está bloqueado. NULL si no está bloqueado.';
