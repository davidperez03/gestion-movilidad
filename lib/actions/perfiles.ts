'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfilCompleto(
  userId: string,
  datos: {
    rol: 'usuario' | 'inspector' | 'administrador'
    activo: boolean
    telefono?: string | null
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

export async function crearUsuario(datos: {
  correo: string
  password: string
  nombre_completo: string
  rol: 'usuario' | 'inspector' | 'administrador'
  telefono?: string
  zona_horaria?: string
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
    throw new Error('No tienes permisos para realizar esta acción')
  }

  // Crear usuario en auth usando admin client
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: datos.correo,
    password: datos.password,
    email_confirm: true,
    user_metadata: {
      nombre_completo: datos.nombre_completo
    }
  })

  if (authError) {
    throw authError
  }

  if (!authData.user) {
    throw new Error('Error al crear el usuario')
  }

  // Actualizar el perfil con los datos adicionales y el creador
  const { error: updateError } = await adminClient
    .from('perfiles')
    .update({
      rol: datos.rol,
      telefono: datos.telefono || null,
      zona_horaria: datos.zona_horaria || 'America/Bogota',
      creado_por: user.id,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', authData.user.id)

  if (updateError) {
    throw updateError
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true, userId: authData.user.id }
}
