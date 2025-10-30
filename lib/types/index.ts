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

// Enums y tipos de estado
export type RolUsuario = Perfil['rol']
export type EstadoVehiculo = Vehiculo['estado_operativo']
export type EstadoInspeccion = Inspeccion['estado']
export type CategoriaItem = ItemInspeccion['categoria']
export type EstadoItem = ItemInspeccion['estado']
export type TipoEvento = BitacoraEvento['tipo_evento']
