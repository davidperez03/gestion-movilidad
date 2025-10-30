/**
 * Utilidades para manejo de zona horaria de Colombia
 * Colombia usa America/Bogota (GMT-5) todo el año (no hay horario de verano)
 */

export const COLOMBIA_TIMEZONE = 'America/Bogota'

/**
 * Formatea una fecha en la zona horaria de Colombia
 */
export function formatearFechaColombia(
  fecha: Date | string,
  opciones?: Intl.DateTimeFormatOptions
): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha

  const opcionesPorDefecto: Intl.DateTimeFormatOptions = {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...opciones
  }

  return new Intl.DateTimeFormat('es-CO', opcionesPorDefecto).format(fechaObj)
}

/**
 * Formatea solo la fecha (sin hora) en formato colombiano
 */
export function formatearSoloFechaColombia(fecha: Date | string): string {
  return formatearFechaColombia(fecha, {
    hour: undefined,
    minute: undefined,
    hour12: undefined
  })
}

/**
 * Formatea solo la hora en formato colombiano (24h)
 */
export function formatearSoloHoraColombia(fecha: Date | string): string {
  return formatearFechaColombia(fecha, {
    year: undefined,
    month: undefined,
    day: undefined
  })
}

/**
 * Obtiene la fecha/hora actual en Colombia
 */
export function obtenerFechaActualColombia(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: COLOMBIA_TIMEZONE })
  )
}

/**
 * Convierte una fecha a la zona horaria de Colombia
 */
export function convertirAZonaHorariaColombia(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  return fechaObj.toLocaleString('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatearFechaRelativa(fecha: Date | string): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = obtenerFechaActualColombia()
  const diferenciaMs = ahora.getTime() - fechaObj.getTime()

  const segundos = Math.floor(diferenciaMs / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)
  const meses = Math.floor(dias / 30)
  const años = Math.floor(dias / 365)

  if (años > 0) return `hace ${años} ${años === 1 ? 'año' : 'años'}`
  if (meses > 0) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  if (dias > 0) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  if (horas > 0) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  if (minutos > 0) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  return 'hace unos segundos'
}

/**
 * Valida si una fecha está en el futuro (respecto a hora de Colombia)
 */
export function esFechaFutura(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  return fechaObj > obtenerFechaActualColombia()
}

/**
 * Calcula el tiempo restante hasta una fecha
 */
export function tiempoRestanteHasta(fecha: Date | string): {
  dias: number
  horas: number
  minutos: number
  segundos: number
  texto: string
} {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = obtenerFechaActualColombia()
  const diferenciaMs = fechaObj.getTime() - ahora.getTime()

  if (diferenciaMs <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, texto: 'Ya pasó' }
  }

  const segundos = Math.floor((diferenciaMs / 1000) % 60)
  const minutos = Math.floor((diferenciaMs / (1000 * 60)) % 60)
  const horas = Math.floor((diferenciaMs / (1000 * 60 * 60)) % 24)
  const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))

  let texto = ''
  if (dias > 0) texto += `${dias}d `
  if (horas > 0) texto += `${horas}h `
  if (minutos > 0) texto += `${minutos}m`

  return {
    dias,
    horas,
    minutos,
    segundos,
    texto: texto.trim() || 'Menos de 1 minuto'
  }
}

/**
 * Formatea una duración en minutos a texto legible
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} minuto${minutos !== 1 ? 's' : ''}`

  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  if (minutosRestantes === 0) {
    return `${horas} hora${horas !== 1 ? 's' : ''}`
  }

  return `${horas} hora${horas !== 1 ? 's' : ''} y ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}`
}
