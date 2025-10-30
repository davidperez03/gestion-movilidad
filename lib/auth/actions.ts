'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Registrar el último acceso del usuario
export async function registrarUltimoAcceso(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('registrar_ultimo_acceso', {
    usuario_id: userId
  })

  if (error) {
    console.error('Error al registrar último acceso:', error)
  }
}

// Incrementar intentos fallidos de login
export async function incrementarIntentosFallidos(correo: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('incrementar_intentos_fallidos', {
    usuario_correo: correo
  })

  if (error) {
    console.error('Error al incrementar intentos fallidos:', error)
  }
}

// Verificar si el usuario está bloqueado
export async function verificarUsuarioBloqueado(correo: string): Promise<{ bloqueado: boolean, hasta?: Date }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('perfiles')
    .select('bloqueado_hasta')
    .eq('correo', correo)
    .single()

  if (error || !data) {
    return { bloqueado: false }
  }

  if (data.bloqueado_hasta) {
    const fechaBloqueo = new Date(data.bloqueado_hasta)
    if (fechaBloqueo > new Date()) {
      return { bloqueado: true, hasta: fechaBloqueo }
    }
  }

  return { bloqueado: false }
}
