-- ============================================
-- DATOS DE PRUEBA - RECURSOS BÁSICOS
-- ============================================
-- Datos iniciales para desarrollo y testing
-- ============================================

-- ============================================
-- VEHÍCULOS DE PRUEBA
-- ============================================

INSERT INTO public.vehiculos (
  placa, marca, modelo, tipo, activo,
  soat_vencimiento, tecnomecanica_vencimiento,
  soat_aseguradora
) VALUES
  ('ABC123', 'Chevrolet', 'NPR', 'GRÚA DE PLATAFORMA', true,
   CURRENT_DATE + INTERVAL '6 months', CURRENT_DATE + INTERVAL '8 months',
   'Seguros Bolívar'),

  ('DEF456', 'Hino', '816', 'GRÚA DE PLATAFORMA', true,
   CURRENT_DATE + INTERVAL '4 months', CURRENT_DATE + INTERVAL '5 months',
   'SURA'),

  ('GHI789', 'Chevrolet', 'FRR', 'GRÚA DE PLATAFORMA', true,
   CURRENT_DATE + INTERVAL '2 months', CURRENT_DATE + INTERVAL '3 months',
   'Allianz'),

  ('JKL012', 'Isuzu', 'NQR', 'GRÚA DE PLATAFORMA', true,
   CURRENT_DATE + INTERVAL '10 months', CURRENT_DATE + INTERVAL '11 months',
   'Liberty Seguros'),

  ('MNO345', 'Hino', '500', 'GRÚA DE PLATAFORMA', true,
   CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month',
   'Seguros Bolívar')
ON CONFLICT (placa) DO NOTHING;

-- ============================================
-- OPERARIOS DE PRUEBA
-- ============================================

INSERT INTO public.operarios (
  nombre, cedula, telefono, activo, fecha_ingreso,
  es_conductor, licencia_conduccion, categoria_licencia,
  licencia_vencimiento, eps, arl, tipo_sangre
) VALUES
  ('Juan Pérez Gómez', '1234567890', '3001234567', true, '2020-01-15',
   true, 'L123456', 'C2', CURRENT_DATE + INTERVAL '2 years',
   'Sanitas', 'SURA', 'O+'),

  ('Carlos Rodríguez López', '9876543210', '3009876543', true, '2019-06-20',
   true, 'L654321', 'C2', CURRENT_DATE + INTERVAL '1 year',
   'Compensar', 'Positiva', 'A+'),

  ('Miguel Ángel Torres', '1122334455', '3101122334', true, '2021-03-10',
   true, 'L998877', 'C2', CURRENT_DATE + INTERVAL '3 years',
   'Nueva EPS', 'SURA', 'B+'),

  ('Pedro Antonio Silva', '5544332211', '3205544332', true, '2020-09-05',
   true, 'L556677', 'C2', CURRENT_DATE + INTERVAL '18 months',
   'Salud Total', 'Positiva', 'AB+'),

  ('Jorge Luis Martínez', '6677889900', '3156677889', true, '2022-01-12',
   true, 'L445566', 'C2', CURRENT_DATE + INTERVAL '4 years',
   'Sanitas', 'SURA', 'O-')
ON CONFLICT (cedula) DO NOTHING;

-- ============================================
-- AUXILIARES DE PRUEBA
-- ============================================

INSERT INTO public.auxiliares (
  nombre, cedula, telefono, activo, fecha_ingreso,
  eps, arl, tipo_sangre
) VALUES
  ('Roberto Sánchez Castro', '2233445566', '3002233445', true, '2020-02-01',
   'Compensar', 'Positiva', 'A+'),

  ('Luis Fernando Díaz', '7788990011', '3107788990', true, '2019-11-15',
   'Sanitas', 'SURA', 'O+'),

  ('Andrés Camilo Ruiz', '3344556677', '3203344556', true, '2021-05-20',
   'Nueva EPS', 'Positiva', 'B+'),

  ('Diego Alejandro Moreno', '9988776655', '3159988776', true, '2020-08-10',
   'Salud Total', 'SURA', 'AB-'),

  ('Sebastián Vargas Ortiz', '5566778899', '3015566778', true, '2021-12-01',
   'Compensar', 'Positiva', 'O+')
ON CONFLICT (cedula) DO NOTHING;

-- ============================================
-- INSPECTORES DE PRUEBA
-- ============================================

INSERT INTO public.inspectores (
  nombre, documento, cargo, telefono, activo,
  certificaciones, especialidades
) VALUES
  ('Ing. María Fernanda López', '4455667788', 'Inspector HSE Senior', '3104455667', true,
   ARRAY['ISO 9001', 'OHSAS 18001', 'ISO 14001'],
   ARRAY['Seguridad Industrial', 'Medio Ambiente']),

  ('Ing. Carlos Eduardo Ramírez', '8899001122', 'Inspector Técnico', '3208899001', true,
   ARRAY['Mecánica Automotriz', 'Seguridad Vial'],
   ARRAY['Vehículos de Carga', 'Sistemas Hidráulicos']),

  ('Tec. Ana María Gutiérrez', '1122334455', 'Supervisora de Operaciones', '3151122334', true,
   ARRAY['Seguridad Vial', 'Primeros Auxilios'],
   ARRAY['Operaciones', 'Logística'])
ON CONFLICT (documento) DO NOTHING;

-- ============================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================

DO $$
DECLARE
  v_vehiculos INTEGER;
  v_operarios INTEGER;
  v_auxiliares INTEGER;
  v_inspectores INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_vehiculos FROM public.vehiculos;
  SELECT COUNT(*) INTO v_operarios FROM public.operarios;
  SELECT COUNT(*) INTO v_auxiliares FROM public.auxiliares;
  SELECT COUNT(*) INTO v_inspectores FROM public.inspectores;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATOS DE PRUEBA INSERTADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Vehículos: %', v_vehiculos;
  RAISE NOTICE 'Operarios: %', v_operarios;
  RAISE NOTICE 'Auxiliares: %', v_auxiliares;
  RAISE NOTICE 'Inspectores: %', v_inspectores;
  RAISE NOTICE '========================================';
END $$;
