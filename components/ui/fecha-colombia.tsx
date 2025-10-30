'use client'

import { formatearFechaColombia, formatearFechaRelativa, formatearSoloFechaColombia, formatearSoloHoraColombia } from '@/lib/utils/timezone'

interface FechaColombiaProps {
  fecha: Date | string | null | undefined
  formato?: 'completo' | 'fecha' | 'hora' | 'relativo'
  className?: string
  placeholder?: string
}

/**
 * Componente para mostrar fechas en la zona horaria de Colombia
 *
 * @example
 * <FechaColombia fecha={usuario.ultimo_acceso} formato="relativo" />
 * <FechaColombia fecha={inspeccion.fecha} formato="fecha" />
 * <FechaColombia fecha={evento.hora_inicio} formato="hora" />
 */
export function FechaColombia({
  fecha,
  formato = 'completo',
  className = '',
  placeholder = '-'
}: FechaColombiaProps) {
  if (!fecha) {
    return <span className={className}>{placeholder}</span>
  }

  let textoFormateado: string

  switch (formato) {
    case 'fecha':
      textoFormateado = formatearSoloFechaColombia(fecha)
      break
    case 'hora':
      textoFormateado = formatearSoloHoraColombia(fecha)
      break
    case 'relativo':
      textoFormateado = formatearFechaRelativa(fecha)
      break
    case 'completo':
    default:
      textoFormateado = formatearFechaColombia(fecha)
      break
  }

  return (
    <span className={className} title={formatearFechaColombia(fecha)}>
      {textoFormateado}
    </span>
  )
}
