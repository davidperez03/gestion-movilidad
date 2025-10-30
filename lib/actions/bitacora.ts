'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BitacoraEvento, NuevoEvento } from '@/lib/types'

/**
 * Obtener todos los eventos de bitácora con paginación
 */
export async function obtenerEventosBitacora(params?: {
  pagina?: number
  limite?: number
  vehiculoId?: string
  estado?: string
  tipoEvento?: string
  fechaInicio?: string
  fechaFin?: string
}) {
  const supabase = await createClient()

  const {
    pagina = 1,
    limite = 20,
    vehiculoId,
    estado,
    tipoEvento,
    fechaInicio,
    fechaFin,
  } = params || {}

  let query = supabase
    .from('bitacora_eventos')
    .select(`
      *,
      vehiculos (
        id,
        placa,
        marca,
        modelo,
        tipo
      ),
      operarios (
        id,
        nombre,
        cedula
      ),
      auxiliares (
        id,
        nombre,
        cedula
      )
    `, { count: 'exact' })
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })

  // Filtros
  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)
  if (estado) query = query.eq('estado', estado)
  if (tipoEvento) query = query.eq('tipo_evento', tipoEvento)
  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin) query = query.lte('fecha', fechaFin)

  // Paginación
  const inicio = (pagina - 1) * limite
  query = query.range(inicio, inicio + limite - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error al obtener eventos: ${error.message}`)
  }

  return {
    eventos: data || [],
    total: count || 0,
    pagina,
    totalPaginas: Math.ceil((count || 0) / limite),
  }
}

/**
 * Obtener un evento específico por ID
 */
export async function obtenerEventoPorId(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bitacora_eventos')
    .select(`
      *,
      vehiculos (*),
      operarios (*),
      auxiliares (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Error al obtener evento: ${error.message}`)
  }

  return data
}

/**
 * Crear un nuevo evento de bitácora
 */
export async function crearEventoBitacora(datos: NuevoEvento) {
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

  // Crear evento
  const { data, error } = await supabase
    .from('bitacora_eventos')
    .insert({
      ...datos,
      creado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear evento: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora')
  return { success: true, evento: data }
}

/**
 * Actualizar un evento existente
 */
export async function actualizarEventoBitacora(
  id: string,
  datos: Partial<BitacoraEvento>
) {
  const supabase = await createClient()

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data, error } = await supabase
    .from('bitacora_eventos')
    .update({
      ...datos,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar evento: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora')
  revalidatePath(`/dashboard/bitacora/${id}`)
  return { success: true, evento: data }
}

/**
 * Cerrar un evento activo
 */
export async function cerrarEventoBitacora(id: string, datos: {
  hora_fin: string
  kilometraje_fin?: number
  combustible_final?: number
  ubicacion_fin?: string
  observaciones?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  // Obtener el evento
  const { data: evento, error: eventoError } = await supabase
    .from('bitacora_eventos')
    .select('*')
    .eq('id', id)
    .single()

  if (eventoError || !evento) {
    throw new Error('Evento no encontrado')
  }

  if (evento.estado !== 'activo') {
    throw new Error('El evento ya está cerrado o cancelado')
  }

  // Calcular horas de operación
  const horaInicio = new Date(`${evento.fecha}T${evento.hora_inicio}`)
  const horaFin = new Date(`${evento.fecha}T${datos.hora_fin}`)
  const horas_operacion = (horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60)

  const { data, error } = await supabase
    .from('bitacora_eventos')
    .update({
      ...datos,
      horas_operacion: horas_operacion > 0 ? horas_operacion : null,
      estado: 'cerrado',
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al cerrar evento: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora')
  revalidatePath(`/dashboard/bitacora/${id}`)
  return { success: true, evento: data }
}

/**
 * Cancelar un evento
 */
export async function cancelarEventoBitacora(id: string, motivo: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data, error } = await supabase
    .from('bitacora_eventos')
    .update({
      estado: 'cancelado',
      observaciones: motivo,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al cancelar evento: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora')
  revalidatePath(`/dashboard/bitacora/${id}`)
  return { success: true, evento: data }
}

/**
 * Eliminar un evento (solo para administradores)
 */
export async function eliminarEventoBitacora(id: string) {
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
    throw new Error('No tienes permisos para eliminar eventos')
  }

  const { error } = await supabase
    .from('bitacora_eventos')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Error al eliminar evento: ${error.message}`)
  }

  revalidatePath('/dashboard/bitacora')
  return { success: true }
}

/**
 * Obtener estadísticas de eventos por vehículo
 */
export async function obtenerEstadisticasVehiculo(
  vehiculoId: string,
  fechaInicio?: string,
  fechaFin?: string
) {
  const supabase = await createClient()

  let query = supabase
    .from('bitacora_eventos')
    .select('*')
    .eq('vehiculo_id', vehiculoId)
    .eq('estado', 'cerrado')

  if (fechaInicio) query = query.gte('fecha', fechaInicio)
  if (fechaFin) query = query.lte('fecha', fechaFin)

  const { data: eventos, error } = await query

  if (error) {
    throw new Error(`Error al obtener estadísticas: ${error.message}`)
  }

  // Calcular estadísticas
  const totalEventos = eventos?.length || 0
  const horasTotales = eventos?.reduce((sum, e) => sum + (e.horas_operacion || 0), 0) || 0
  const kilometrosTotales = eventos?.reduce((sum, e) => {
    if (e.kilometraje_inicio && e.kilometraje_fin) {
      return sum + (e.kilometraje_fin - e.kilometraje_inicio)
    }
    return sum
  }, 0) || 0

  const eventosPorTipo = eventos?.reduce((acc, e) => {
    acc[e.tipo_evento] = (acc[e.tipo_evento] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalEventos,
    horasTotales,
    kilometrosTotales,
    eventosPorTipo,
  }
}
