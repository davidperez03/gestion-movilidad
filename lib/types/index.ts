// Exportar tipos de base de datos
export type { Database } from './database.types'
import type { Database } from './database.types'

// Tipos de tablas
export type Perfil = Database['public']['Tables']['perfiles']['Row']
export type Vehiculo = Database['public']['Tables']['vehiculos']['Row']
export type Operario = Database['public']['Tables']['operarios']['Row']
export type Auxiliar = Database['public']['Tables']['auxiliares']['Row']
export type Inspector = Database['public']['Tables']['inspectores']['Row']
export type Inspeccion = Database['public']['Tables']['inspecciones']['Row']
export type ItemInspeccion = Database['public']['Tables']['items_inspeccion']['Row']
export type FotoInspeccion = Database['public']['Tables']['fotos_inspeccion']['Row']
export type BitacoraEvento = Database['public']['Tables']['bitacora_eventos']['Row']

// Tipos para insertar
export type NuevoVehiculo = Database['public']['Tables']['vehiculos']['Insert']
export type NuevoOperario = Database['public']['Tables']['operarios']['Insert']
export type NuevoAuxiliar = Database['public']['Tables']['auxiliares']['Insert']
export type NuevaInspeccion = Database['public']['Tables']['inspecciones']['Insert']
export type NuevoEvento = Database['public']['Tables']['bitacora_eventos']['Insert']

// Tipos con relaciones
export type InspeccionCompleta = Inspeccion & {
  vehiculos?: Vehiculo
  operarios?: Operario
  auxiliares?: Auxiliar | null
  inspectores?: Inspector | null
  items_inspeccion?: ItemInspeccion[]
  fotos_inspeccion?: FotoInspeccion[]
}

// Tipo con relaciones para Bitácora
export type BitacoraEventoCompleta = BitacoraEvento & {
  vehiculos?: Vehiculo
  operarios?: Operario | null
  auxiliares?: Auxiliar | null
}

// Enums y tipos de estado
export type RolUsuario = Perfil['rol']
export type EstadoVehiculo = Vehiculo['estado_operativo']
export type EstadoInspeccion = Inspeccion['estado']
export type CategoriaItem = ItemInspeccion['categoria']
export type EstadoItem = ItemInspeccion['estado']
export type TipoEvento = BitacoraEvento['tipo_evento']
export type EstadoEvento = BitacoraEvento['estado']
export type TurnoEvento = BitacoraEvento['turno']

// Constantes para enums (útil para forms y validaciones)
export const TIPOS_EVENTO = {
  OPERACION: 'operacion',
  MANTENIMIENTO: 'mantenimiento',
  FALLA: 'falla',
  INACTIVO: 'inactivo',
  TRASLADO: 'traslado',
} as const

export const ESTADOS_EVENTO = {
  ACTIVO: 'activo',
  CERRADO: 'cerrado',
  CANCELADO: 'cancelado',
} as const

export const TURNOS = {
  DIURNO: 'diurno',
  NOCTURNO: 'nocturno',
  COMPLETO: 'completo',
} as const

export const ESTADOS_INSPECCION = {
  BORRADOR: 'borrador',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
} as const

export const CATEGORIAS_ITEM = {
  DOCUMENTACION: 'documentacion',
  EXTERIOR: 'exterior',
  INTERIOR: 'interior',
  MECANICO: 'mecanico',
  ELECTRICO: 'electrico',
  SEGURIDAD: 'seguridad',
  HERRAMIENTAS: 'herramientas',
} as const

export const ESTADOS_ITEM = {
  BUENO: 'bueno',
  REGULAR: 'regular',
  MALO: 'malo',
  NO_APLICA: 'no_aplica',
} as const

export const PRIORIDADES = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica',
} as const

// Tipos de formularios para componentes
export type FormularioBitacoraEvento = Omit<NuevoEvento, 'creado_por' | 'creado_en' | 'actualizado_en'>
export type FormularioInspeccion = Omit<NuevaInspeccion, 'creado_por' | 'creado_en' | 'actualizado_en'>
