'use client'

import { FiltrosBitacora } from './filtros-bitacora'
import { useRouter, usePathname } from 'next/navigation'
import type { Vehiculo } from '@/lib/types'

interface FiltrosBitacoraClientProps {
  vehiculos: Vehiculo[]
  filtrosIniciales: {
    vehiculoId?: string
    estado?: string
    tipoEvento?: string
    fechaInicio?: string
    fechaFin?: string
  }
}

export function FiltrosBitacoraClient({
  vehiculos,
  filtrosIniciales,
}: FiltrosBitacoraClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleFiltrosChange = (nuevosFiltros: any) => {
    const params = new URLSearchParams()

    // Agregar solo filtros con valor
    if (nuevosFiltros.vehiculoId) params.set('vehiculoId', nuevosFiltros.vehiculoId)
    if (nuevosFiltros.estado) params.set('estado', nuevosFiltros.estado)
    if (nuevosFiltros.tipoEvento) params.set('tipoEvento', nuevosFiltros.tipoEvento)
    if (nuevosFiltros.fechaInicio) params.set('fechaInicio', nuevosFiltros.fechaInicio)
    if (nuevosFiltros.fechaFin) params.set('fechaFin', nuevosFiltros.fechaFin)

    // Resetear a página 1 cuando cambian filtros
    params.set('pagina', '1')

    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <FiltrosBitacora
      vehiculos={vehiculos}
      filtros={filtrosIniciales}
      onFiltrosChange={handleFiltrosChange}
    />
  )
}
