'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Obtener roles operativos de un usuario
 */
export async function obtenerRolesUsuario(perfilId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles_operativos')
    .select('*')
    .eq('perfil_id', perfilId)
    .order('creado_en')

  if (error) {
    throw new Error(`Error al obtener roles: ${error.message}`)
  }

  return data || []
}

/**
 * Agregar rol operativo a un usuario
 */
export async function agregarRolOperativo(datos: {
  perfil_id: string
  rol: 'operario' | 'auxiliar' | 'inspector'
  licencia_conduccion?: string
  categoria_licencia?: string
  licencia_vencimiento?: string
}) {
  const supabase = await createClient()

  // Verificar que el usuario actual es administrador
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilActual?.rol !== 'administrador') {
    throw new Error('No tienes permisos para asignar roles operativos')
  }

  // Validaciones
  if (datos.rol === 'operario' && !datos.licencia_conduccion) {
    throw new Error('Los operarios requieren número de licencia de conducción')
  }

  const { data, error } = await supabase
    .from('roles_operativos')
    .insert({
      perfil_id: datos.perfil_id,
      rol: datos.rol,
      licencia_conduccion: datos.licencia_conduccion || null,
      categoria_licencia: datos.categoria_licencia || null,
      licencia_vencimiento: datos.licencia_vencimiento || null,
      activo: true,
      creado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('El usuario ya tiene este rol asignado')
    }
    throw new Error(`Error al agregar rol: ${error.message}`)
  }

  revalidatePath('/dashboard/usuarios')
  revalidatePath(`/dashboard/usuarios/${datos.perfil_id}`)
  return { success: true, rol: data }
}

/**
 * Actualizar rol operativo
 */
export async function actualizarRolOperativo(
  rolId: string,
  datos: {
    licencia_conduccion?: string
    categoria_licencia?: string
    licencia_vencimiento?: string
    activo?: boolean
    fecha_fin?: string
    motivo_inactivacion?: string
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilActual?.rol !== 'administrador') {
    throw new Error('No tienes permisos para modificar roles operativos')
  }

  const { data, error } = await supabase
    .from('roles_operativos')
    .update({
      ...datos,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', rolId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar rol: ${error.message}`)
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true, rol: data }
}

/**
 * Desactivar rol operativo
 */
export async function desactivarRolOperativo(
  rolId: string,
  motivo?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilActual?.rol !== 'administrador') {
    throw new Error('No tienes permisos para desactivar roles operativos')
  }

  const { data, error } = await supabase
    .from('roles_operativos')
    .update({
      activo: false,
      fecha_fin: new Date().toISOString().split('T')[0],
      motivo_inactivacion: motivo || null,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', rolId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al desactivar rol: ${error.message}`)
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true, rol: data }
}

/**
 * Eliminar rol operativo (solo si no ha sido usado)
 */
export async function eliminarRolOperativo(rolId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No autenticado')
  }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilActual?.rol !== 'administrador') {
    throw new Error('No tienes permisos para eliminar roles operativos')
  }

  const { error } = await supabase
    .from('roles_operativos')
    .delete()
    .eq('id', rolId)

  if (error) {
    throw new Error(`Error al eliminar rol: ${error.message}`)
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

/**
 * Obtener usuarios con un rol operativo específico
 */
export async function obtenerUsuariosPorRol(rol: 'operario' | 'auxiliar' | 'inspector') {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles_operativos')
    .select(`
      id,
      perfil_id,
      rol,
      licencia_conduccion,
      categoria_licencia,
      licencia_vencimiento,
      activo,
      perfiles (
        id,
        nombre_completo,
        correo,
        telefono
      )
    `)
    .eq('rol', rol)
    .eq('activo', true)
    .order('perfiles(nombre_completo)')

  if (error) {
    throw new Error(`Error al obtener usuarios: ${error.message}`)
  }

  return data || []
}
