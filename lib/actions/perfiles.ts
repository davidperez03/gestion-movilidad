'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfilCompleto(
  userId: string,
  datos: {
    rol: 'usuario' | 'inspector' | 'administrador'
    activo: boolean
    telefono?: string | null
    cargo?: string | null
    zona_horaria?: string
  }
) {
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
    throw new Error('No tienes permisos para realizar esta acción')
  }

  // No permitir desactivarse a sí mismo
  if (userId === user.id && !datos.activo) {
    throw new Error('No puedes desactivar tu propia cuenta')
  }

  // Actualizar el perfil completo
  const { error } = await supabase
    .from('perfiles')
    .update({
      rol: datos.rol,
      activo: datos.activo,
      telefono: datos.telefono,
      cargo: datos.cargo,
      zona_horaria: datos.zona_horaria,
      actualizado_en: new Date().toISOString(),
      actualizado_por: user.id
    })
    .eq('id', userId)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

export async function obtenerTodosLosUsuarios() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('creado_en', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function desbloquearUsuario(userId: string) {
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
    throw new Error('No tienes permisos para realizar esta acción')
  }

  // Desbloquear usuario
  const { error } = await supabase
    .from('perfiles')
    .update({
      bloqueado_hasta: null,
      intentos_login_fallidos: 0,
      actualizado_en: new Date().toISOString(),
      actualizado_por: user.id
    })
    .eq('id', userId)

  if (error) {
    throw error
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}
