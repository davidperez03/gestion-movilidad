-- ============================================
-- EJECUTAR TODOS LOS SEEDS
-- ============================================
-- Datos de prueba para desarrollo y testing
-- IMPORTANTE: Ejecutar después de las migraciones
-- ============================================

\echo '=========================================='
\echo 'Insertando datos de prueba básicos'
\echo '=========================================='
\i 01_datos_prueba_basicos.sql

\echo ''
\echo '=========================================='
\echo 'Insertando eventos y bitácora'
\echo '=========================================='
\i 02_datos_prueba_eventos.sql

-- ============================================
-- RESUMEN FINAL
-- ============================================

\echo ''
\echo '=========================================='
\echo 'RESUMEN DE DATOS INSERTADOS'
\echo '=========================================='

SELECT
  'Vehículos' as tabla,
  COUNT(*) as registros
FROM public.vehiculos
UNION ALL
SELECT 'Operarios', COUNT(*) FROM public.operarios
UNION ALL
SELECT 'Auxiliares', COUNT(*) FROM public.auxiliares
UNION ALL
SELECT 'Inspectores', COUNT(*) FROM public.inspectores
UNION ALL
SELECT 'Eventos', COUNT(*) FROM public.bitacora_eventos
UNION ALL
SELECT 'Cierres', COUNT(*) FROM public.bitacora_cierres;

\echo '=========================================='
\echo 'Datos de prueba cargados correctamente'
\echo '=========================================='
