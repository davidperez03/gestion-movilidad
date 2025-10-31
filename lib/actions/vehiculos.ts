'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Vehiculo, NuevoVehiculo } from '@/lib/types'

/**
 * Obtener todos los vehículos con paginación y filtros
 */
export async function obtenerVehiculos(params?: {
  pagina?: number
  limite?: number
  activo?: boolean
  busqueda?: string
}) {
  const supabase = await createClient()

  const {
    pagina = 1,
    limite = 20,
    activo,
    busqueda,
  } = params || {}

  let query = supabase
    .from('vehiculos')
    .select('*', { count: 'exact' })
    .order('placa', { ascending: true })

  // Filtros
  if (activo !== undefined) query = query.eq('activo', activo)
  if (busqueda) {
    query = query.or(`placa.ilike.%${busqueda}%,marca.ilike.%${busqueda}%,modelo.ilike.%${busqueda}%`)
  }

  // Paginación
  const inicio = (pagina - 1) * limite
  query = query.range(inicio, inicio + limite - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error al obtener vehículos: ${error.message}`)
  }

  return {
    vehiculos: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite),
  }
}

/**
 * Obtener un vehículo específico por ID
 */
export async function obtenerVehiculoPorId(id: string): Promise<Vehiculo> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vehiculos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Error al obtener vehículo: ${error.message}`)
  }

  return data
}

/**
 * Crear un nuevo vehículo
 */
export async function crearVehiculo(datos: {
  placa: string
  marca?: string
  modelo?: string
  tipo?: string
  soat_vencimiento?: string
  tecnomecanica_vencimiento?: string
  soat_aseguradora?: string
  numero_poliza_soat?: string
  observaciones?: string
}) {
  const supabase = await createClient()

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  // Verificar permisos de administrador
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'administrador') {
    throw new Error('No tienes permisos para crear vehículos')
  }

  // Validar placa única
  const { data: existente } = await supabase
    .from('vehiculos')
    .select('id')
    .eq('placa', datos.placa.toUpperCase())
    .single()

  if (existente) {
    throw new Error('Ya existe un vehículo con esta placa')
  }

  // Crear vehículo
  const { data, error } = await supabase
    .from('vehiculos')
    .insert({
      placa: datos.placa.toUpperCase(),
      marca: datos.marca || null,
      modelo: datos.modelo || null,
      tipo: 'GRÚA DE PLATAFORMA',
      soat_vencimiento: datos.soat_vencimiento || null,
      tecnomecanica_vencimiento: datos.tecnomecanica_vencimiento || null,
      soat_aseguradora: datos.soat_aseguradora || null,
      numero_poliza_soat: datos.numero_poliza_soat || null,
      observaciones: datos.observaciones || null,
      activo: true,
      creado_por: user.id,
      actualizado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear vehículo: ${error.message}`)
  }

  revalidatePath('/dashboard/vehiculos')
  return { success: true, vehiculo: data }
}

/**
 * Actualizar un vehículo existente
 */
export async function actualizarVehiculo(
  id: string,
  datos: {
    placa?: string
    marca?: string
    modelo?: string
    tipo?: string
    activo?: boolean
    soat_vencimiento?: string
    tecnomecanica_vencimiento?: string
    soat_aseguradora?: string
    numero_poliza_soat?: string
    observaciones?: string
  }
) {
  const supabase = await createClient()

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  // Verificar permisos de administrador
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'administrador') {
    throw new Error('No tienes permisos para actualizar vehículos')
  }

  // Si se actualiza la placa, validar que no exista
  if (datos.placa) {
    const { data: existente } = await supabase
      .from('vehiculos')
      .select('id')
      .eq('placa', datos.placa.toUpperCase())
      .neq('id', id)
      .single()

    if (existente) {
      throw new Error('Ya existe otro vehículo con esta placa')
    }

    datos.placa = datos.placa.toUpperCase()
  }

  const { data, error } = await supabase
    .from('vehiculos')
    .update({
      ...datos,
      actualizado_por: user.id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar vehículo: ${error.message}`)
  }

  revalidatePath('/dashboard/vehiculos')
  revalidatePath(`/dashboard/vehiculos/${id}`)
  return { success: true, vehiculo: data }
}

/**
 * Eliminar un vehículo (solo para administradores)
 */
export async function eliminarVehiculo(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  // Verificar permisos de administrador
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'administrador') {
    throw new Error('No tienes permisos para eliminar vehículos')
  }

  // Verificar que no tenga eventos asociados
  const { data: eventos } = await supabase
    .from('bitacora_eventos')
    .select('id')
    .eq('vehiculo_id', id)
    .limit(1)

  if (eventos && eventos.length > 0) {
    throw new Error('No se puede eliminar un vehículo con eventos registrados')
  }

  const { error } = await supabase
    .from('vehiculos')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error al eliminar vehículo: ${error.message}`)
  }

  revalidatePath('/dashboard/vehiculos')
  return { success: true }
}

/**
 * Obtener vehículos activos y operativos (para formularios)
 */
export async function obtenerVehiculosDisponibles() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo, tipo')
    .eq('activo', true)
    .order('placa')

  if (error) {
    throw new Error(`Error al obtener vehículos: ${error.message}`)
  }

  return data || []
}
