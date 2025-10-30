// Tipos generados para Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          correo: string
          nombre_completo: string | null
          telefono: string | null
          rol: 'usuario' | 'inspector' | 'administrador'
          activo: boolean
          url_avatar: string | null
          zona_horaria: string
          preferencias: Json
          ultimo_acceso: string | null
          intentos_login_fallidos: number
          bloqueado_hasta: string | null
          creado_en: string
          actualizado_en: string
          creado_por: string | null
          actualizado_por: string | null
        }
        Insert: Omit<Database['public']['Tables']['perfiles']['Row'], 'creado_en' | 'actualizado_en'>
        Update: Partial<Database['public']['Tables']['perfiles']['Insert']>
      }
      vehiculos: {
        Row: {
          id: string
          placa: string
          marca: string | null
          modelo: string | null
          tipo: string
          año: number | null
          color: string | null
          vin: string | null
          activo: boolean
          estado_operativo: 'operativo' | 'mantenimiento' | 'reparacion' | 'inactivo'
          soat_vencimiento: string | null
          tecnomecanica_vencimiento: string | null
          soat_aseguradora: string | null
          numero_poliza_soat: string | null
          kilometraje_actual: number | null
          ultimo_mantenimiento: string | null
          proximo_mantenimiento: string | null
          observaciones: string | null
          creado_en: string
          actualizado_en: string
          creado_por: string | null
          actualizado_por: string | null
        }
        Insert: Omit<Database['public']['Tables']['vehiculos']['Row'], 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Database['public']['Tables']['vehiculos']['Insert']>
      }
      roles_operativos: {
        Row: {
          id: string
          perfil_id: string
          rol: 'operario' | 'auxiliar' | 'inspector'
          licencia_conduccion: string | null
          categoria_licencia: 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3' | null
          licencia_vencimiento: string | null
          activo: boolean
          fecha_inicio: string
          fecha_fin: string | null
          motivo_inactivacion: string | null
          creado_en: string
          actualizado_en: string
          creado_por: string | null
          actualizado_por: string | null
        }
        Insert: Omit<Database['public']['Tables']['roles_operativos']['Row'], 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Database['public']['Tables']['roles_operativos']['Insert']>
      }
      inspecciones: {
        Row: {
          id: string
          vehiculo_id: string
          operario_perfil_id: string
          auxiliar_perfil_id: string | null
          inspector_perfil_id: string | null
          fecha: string
          hora: string
          nombre_operario: string
          cedula_operario: string
          tiene_auxiliar: boolean
          nombre_auxiliar: string | null
          cedula_auxiliar: string | null
          placa_vehiculo: string
          marca_vehiculo: string | null
          modelo_vehiculo: string | null
          kilometraje: number | null
          nombre_inspector: string
          cargo_inspector: string
          documento_inspector: string
          es_apto: boolean
          puntaje_total: number | null
          items_verificados: number
          items_buenos: number
          items_regulares: number
          items_malos: number
          items_no_aplica: number
          observaciones_generales: string | null
          recomendaciones: string | null
          acciones_correctivas: string | null
          firma_operario_data_url: string | null
          firma_supervisor_data_url: string | null
          estado: 'borrador' | 'completada' | 'cancelada'
          creado_en: string
          actualizado_en: string
          creado_por: string
          actualizado_por: string | null
        }
        Insert: Omit<Database['public']['Tables']['inspecciones']['Row'], 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Database['public']['Tables']['inspecciones']['Insert']>
      }
      items_inspeccion: {
        Row: {
          id: string
          inspeccion_id: string
          item_id: string
          nombre: string
          categoria: 'documentacion' | 'exterior' | 'interior' | 'mecanico' | 'electrico' | 'seguridad' | 'herramientas'
          estado: 'bueno' | 'regular' | 'malo' | 'no_aplica'
          puntuacion: number | null
          observacion: string | null
          es_critico: boolean
          requiere_atencion: boolean
          prioridad: 'baja' | 'media' | 'alta' | 'critica' | null
          orden: number
          creado_en: string
        }
        Insert: Omit<Database['public']['Tables']['items_inspeccion']['Row'], 'id' | 'creado_en'>
        Update: Partial<Database['public']['Tables']['items_inspeccion']['Insert']>
      }
      fotos_inspeccion: {
        Row: {
          id: string
          inspeccion_id: string
          url_foto: string
          nombre_archivo: string | null
          tipo_mime: string | null
          tamaño_bytes: number | null
          descripcion: string | null
          categoria: 'general' | 'daño' | 'documentacion' | 'otro' | null
          item_relacionado_id: string | null
          latitud: number | null
          longitud: number | null
          subido_en: string
          subido_por: string
        }
        Insert: Omit<Database['public']['Tables']['fotos_inspeccion']['Row'], 'id' | 'subido_en'>
        Update: Partial<Database['public']['Tables']['fotos_inspeccion']['Insert']>
      }
      bitacora_eventos: {
        Row: {
          id: string
          vehiculo_id: string
          operario_perfil_id: string | null
          auxiliar_perfil_id: string | null
          fecha: string
          hora_inicio: string
          hora_fin: string | null
          tipo_evento: 'operacion' | 'mantenimiento' | 'falla' | 'inactivo' | 'traslado'
          descripcion: string
          turno: 'diurno' | 'nocturno' | 'completo' | null
          horas_operacion: number | null
          kilometraje_inicio: number | null
          kilometraje_fin: number | null
          combustible_inicial: number | null
          combustible_final: number | null
          estado: 'activo' | 'cerrado' | 'cancelado'
          ubicacion_inicio: string | null
          ubicacion_fin: string | null
          observaciones: string | null
          adjuntos: string[] | null
          creado_en: string
          actualizado_en: string
          creado_por: string
          actualizado_por: string | null
        }
        Insert: Omit<Database['public']['Tables']['bitacora_eventos']['Row'], 'id' | 'creado_en' | 'actualizado_en'>
        Update: Partial<Database['public']['Tables']['bitacora_eventos']['Insert']>
      }
    }
  }
}
