-- ============================================
-- CONFIGURACIÓN: Zona Horaria de Colombia
-- ============================================
-- Configura la zona horaria de la base de datos a America/Bogota
-- ============================================

-- Establecer zona horaria de la sesión
SET timezone = 'America/Bogota';

-- Actualizar funciones para usar zona horaria de Colombia
-- ============================================

-- Función: actualizar updated_at (con zona horaria de Colombia)
CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = timezone('America/Bogota'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: registrar último acceso (con zona horaria de Colombia)
CREATE OR REPLACE FUNCTION public.registrar_ultimo_acceso(usuario_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.perfiles
  SET
    ultimo_acceso = timezone('America/Bogota'::text, NOW()),
    intentos_login_fallidos = 0
  WHERE id = usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: incrementar intentos fallidos (con zona horaria de Colombia)
CREATE OR REPLACE FUNCTION public.incrementar_intentos_fallidos(usuario_correo TEXT)
RETURNS void AS $$
DECLARE
  intentos INTEGER;
BEGIN
  UPDATE public.perfiles
  SET intentos_login_fallidos = intentos_login_fallidos + 1
  WHERE correo = usuario_correo
  RETURNING intentos_login_fallidos INTO intentos;

  -- Bloquear por 30 minutos después de 5 intentos
  IF intentos >= 5 THEN
    UPDATE public.perfiles
    SET bloqueado_hasta = timezone('America/Bogota'::text, NOW()) + INTERVAL '30 minutes'
    WHERE correo = usuario_correo;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: crear perfil automáticamente (con zona horaria de Colombia)
CREATE OR REPLACE FUNCTION public.crear_perfil_automaticamente()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (
    id,
    correo,
    nombre_completo,
    rol,
    activo,
    creado_en,
    actualizado_en
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    'usuario',
    true,
    timezone('America/Bogota'::text, NOW()),
    timezone('America/Bogota'::text, NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función auxiliar: Obtener hora actual de Colombia
CREATE OR REPLACE FUNCTION public.fecha_colombia()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN timezone('America/Bogota'::text, NOW());
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.fecha_colombia() IS
  'Retorna la fecha y hora actual en la zona horaria de Colombia (America/Bogota, GMT-5)';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Zona horaria configurada a America/Bogota (GMT-5)';
  RAISE NOTICE 'Funciones actualizadas para usar zona horaria de Colombia';
END $$;
