'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BitacoraCierre, BitacoraCierreCompleto, NuevoCierre } from '@/lib/types'

/**
 * Obtener todos los cierres con paginación y filtros
 */
export async function obtenerCierres(params?: {
  pagina?: number
  limite?: number
  vehiculoId?: string
  fechaInicio?: string
  fechaFin?: string
}) {
  const supabase = await createClient()

  const {
    pagina = 1,
    limite = 20,
    vehiculoId,
    fechaInicio,
    fechaFin,
  } = params || {}

  let query = supabase
    .from('bitacora_cierres')
    .select(`
      *,
      vehiculos (
        id,
        placa,
        marca,
        modelo,
        tipo
      ),
      operario_perfil:perfiles!bitacora_cierres_operario_perfil_id_fkey (
        id,
        nombre_completo,
        correo
      )
    `, { count: 'exact' })
    .order('fecha_inicio', { ascending: false })

  // Filtros
  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)
  if (fechaInicio) query = query.gte('fecha_inicio', fechaInicio)
  if (fechaFin) query = query.lte('fecha_fin', fechaFin)

  // Paginación
  const inicio = (pagina - 1) * limite
  query = query.range(inicio, inicio + limite - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error al obtener cierres: ${error.message}`)
  }

  return {
    cierres: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite),
  }
}

/**
 * Obtener un cierre específico por ID
 */
export async function obtenerCierrePorId(id: string): Promise<BitacoraCierreCompleto> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bitacora_cierres')
    .select(`
      *,
      vehiculos (*),
      operario_perfil:perfiles!bitacora_cierres_operario_perfil_id_fkey (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Error al obtener cierre: ${error.message}`)
  }

  // Obtener eventos relacionados
  if (data.eventos_ids && data.eventos_ids.length > 0) {
    const { data: eventos } = await supabase
      .from('bitacora_eventos')
      .select('*')
      .in('id', data.eventos_ids)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    return {
      ...data,
      eventos: eventos || [],
    }
  }

  return {
    ...data,
    eventos: [],
  }
}

/**
 * Crear un nuevo cierre de período
 */
export async function crearCierre(datos: {
  vehiculo_id: string
  operario_perfil_id?: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  turno?: 'diurno' | 'nocturno' | 'mixto'
  eventos_ids: string[]
  kilometraje_inicio?: number
  kilometraje_fin?: number
  combustible_consumido?: number
  horas_novedades?: number
  observaciones?: string
}) {
  const supabase = await createClient()

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  // Validar que el vehículo existe
  const { data: vehiculo, error: vehiculoError } = await supabase
    .from('vehiculos')
    .select('id')
    .eq('id', datos.vehiculo_id)
    .single()

  if (vehiculoError || !vehiculo) {
    throw new Error('Vehículo no encontrado')
  }

  // Calcular horas de operación
  const fechaHoraInicio = new Date(`${datos.fecha_inicio}T${datos.hora_inicio}`)
  const fechaHoraFin = new Date(`${datos.fecha_fin}T${datos.hora_fin}`)
  const horas_operacion = (fechaHoraFin.getTime() - fechaHoraInicio.getTime()) / (1000 * 60 * 60)

  // Calcular horas efectivas
  const horas_novedades = datos.horas_novedades || 0
  const horas_efectivas = Math.max(0, horas_operacion - horas_novedades)

  // Crear cierre (el trigger calculará el resto de métricas)
  const { data, error } = await supabase
    .from('bitacora_cierres')
    .insert({
      vehiculo_id: datos.vehiculo_id,
      operario_perfil_id: datos.operario_perfil_id || null,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin,
      hora_inicio: datos.hora_inicio,
      hora_fin: datos.hora_fin,
      turno: datos.turno || null,
      horas_operacion: horas_operacion > 0 ? horas_operacion : 0,
      horas_novedades,
      horas_efectivas,
      kilometraje_inicio: datos.kilometraje_inicio || null,
      kilometraje_fin: datos.kilometraje_fin || null,
      combustible_consumido: datos.combustible_consumido || null,
      eventos_ids: datos.eventos_ids,
      observaciones: datos.observaciones || null,
      cerrado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear cierre: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora/cierres')
  revalidatePath('/dashboard/bitacora')
  return { success: true, cierre: data }
}

/**
 * Obtener eventos disponibles para crear un cierre
 * (eventos cerrados que no están en ningún cierre)
 */
export async function obtenerEventosParaCierre(params: {
  vehiculoId: string
  fechaInicio?: string
  fechaFin?: string
}) {
  const supabase = await createClient()

  // Obtener todos los eventos cerrados del vehículo en el rango de fechas
  let query = supabase
    .from('bitacora_eventos')
    .select(`
      *,
      operario_perfil:perfiles!bitacora_eventos_operario_perfil_id_fkey (
        id,
        nombre_completo
      ),
      auxiliar_perfil:perfiles!bitacora_eventos_auxiliar_perfil_id_fkey (
        id,
        nombre_completo
      )
    `)
    .eq('vehiculo_id', params.vehiculoId)
    .eq('estado', 'cerrado')
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })

  if (params.fechaInicio) query = query.gte('fecha', params.fechaInicio)
  if (params.fechaFin) query = query.lte('fecha', params.fechaFin)

  const { data: eventos, error: eventosError } = await query

  if (eventosError) {
    throw new Error(`Error al obtener eventos: ${eventosError.message}`)
  }

  if (!eventos || eventos.length === 0) {
    return []
  }

  // Obtener todos los cierres del vehículo para filtrar eventos ya incluidos
  const { data: cierres } = await supabase
    .from('bitacora_cierres')
    .select('eventos_ids')
    .eq('vehiculo_id', params.vehiculoId)

  // Crear un Set con todos los IDs de eventos ya incluidos en cierres
  const eventosEnCierres = new Set<string>()
  if (cierres) {
    cierres.forEach(cierre => {
      if (cierre.eventos_ids) {
        cierre.eventos_ids.forEach(id => eventosEnCierres.add(id))
      }
    })
  }

  // Filtrar eventos que no estén en ningún cierre
  const eventosDisponibles = eventos.filter(evento => !eventosEnCierres.has(evento.id))

  return eventosDisponibles
}

/**
 * Calcular métricas de un conjunto de eventos
 * Útil para preview antes de crear el cierre
 */
export async function calcularMetricasEventos(eventosIds: string[]) {
  const supabase = await createClient()

  if (eventosIds.length === 0) {
    return {
      totalEventos: 0,
      horasTotales: 0,
      kilometrosTotales: 0,
      combustibleConsumido: 0,
    }
  }

  const { data: eventos, error } = await supabase
    .from('bitacora_eventos')
    .select('*')
    .in('id', eventosIds)

  if (error) {
    throw new Error(`Error al calcular métricas: ${error.message}`)
  }

  const totalEventos = eventos?.length || 0
  const horasTotales = eventos?.reduce((sum, e) => sum + (e.horas_operacion || 0), 0) || 0

  const kilometrosTotales = eventos?.reduce((sum, e) => {
    if (e.kilometraje_inicio && e.kilometraje_fin) {
      return sum + (e.kilometraje_fin - e.kilometraje_inicio)
    }
    return sum
  }, 0) || 0

  const combustibleConsumido = eventos?.reduce((sum, e) => {
    if (e.combustible_inicial && e.combustible_final) {
      return sum + (e.combustible_inicial - e.combustible_final)
    }
    return sum
  }, 0) || 0

  return {
    totalEventos,
    horasTotales,
    kilometrosTotales,
    combustibleConsumido,
  }
}

/**
 * Eliminar un cierre (solo para administradores)
 */
export async function eliminarCierre(id: string) {
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
    throw new Error('No tienes permisos para eliminar cierres')
  }

  const { error } = await supabase
    .from('bitacora_cierres')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error al eliminar cierre: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora/cierres')
  return { success: true }
}
