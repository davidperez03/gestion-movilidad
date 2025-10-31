'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronRight, Calendar } from 'lucide-react'
import type { Vehiculo } from '@/lib/types'
import { format, differenceInDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface VehiculoCardProps {
  vehiculo: Vehiculo
}

export function VehiculoCard({ vehiculo }: VehiculoCardProps) {
  const alertas = []

  if (vehiculo.soat_vencimiento) {
    const dias = differenceInDays(parseISO(vehiculo.soat_vencimiento), new Date())
    if (dias < 0) alertas.push({ tipo: 'SOAT vencido', dias: Math.abs(dias), urgente: true })
    else if (dias <= 30) alertas.push({ tipo: 'SOAT vence pronto', dias, urgente: false })
  }

  if (vehiculo.tecnomecanica_vencimiento) {
    const dias = differenceInDays(parseISO(vehiculo.tecnomecanica_vencimiento), new Date())
    if (dias < 0) alertas.push({ tipo: 'Tecnomecánica vencida', dias: Math.abs(dias), urgente: true })
    else if (dias <= 30) alertas.push({ tipo: 'Tecnomecánica vence pronto', dias, urgente: false })
  }

  return (
    <Link href={`/dashboard/vehiculos/${vehiculo.id}`}>
      <div className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {vehiculo.placa}
            </h3>
            {(vehiculo.marca || vehiculo.modelo) && (
              <p className="text-sm text-muted-foreground mt-1">
                {vehiculo.marca} {vehiculo.modelo}
              </p>
            )}
          </div>
          <Badge
            variant={vehiculo.activo ? 'default' : 'secondary'}
            className="ml-2 font-medium"
          >
            {vehiculo.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Documentación */}
        {(vehiculo.soat_vencimiento || vehiculo.tecnomecanica_vencimiento) && (
          <div className="space-y-2 mb-4 pb-4 border-b border-border">
            {vehiculo.soat_vencimiento && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  SOAT
                </span>
                <span className="font-medium text-foreground">
                  {format(parseISO(vehiculo.soat_vencimiento), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}
            {vehiculo.tecnomecanica_vencimiento && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Tecnomecánica
                </span>
                <span className="font-medium text-foreground">
                  {format(parseISO(vehiculo.tecnomecanica_vencimiento), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="space-y-2 mb-4">
            {alertas.map((alerta, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium ${
                  alerta.urgente
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                    : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="flex-1">{alerta.tipo}</span>
                <span className="font-bold">{alerta.dias}d</span>
              </div>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-end text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
          <span>Ver detalles</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  )
}
