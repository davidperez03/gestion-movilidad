'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FechaColombia } from '@/components/ui/fecha-colombia'
import type { BitacoraEventoCompleta } from '@/lib/types'
import { Clock, MapPin, Truck, User, Users } from 'lucide-react'
import Link from 'next/link'

interface EventoCardProps {
  evento: BitacoraEventoCompleta
  onClick?: () => void
}

export function EventoCard({ evento, onClick }: EventoCardProps) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-green-500">Activo</Badge>
      case 'cerrado':
        return <Badge variant="secondary">Cerrado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getTipoEventoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      operacion: 'Operación',
      mantenimiento: 'Mantenimiento',
      falla: 'Falla',
      inactivo: 'Inactivo',
      traslado: 'Traslado',
    }
    return labels[tipo] || tipo
  }

  const getTipoEventoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      operacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      falla: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      inactivo: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      traslado: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  const CardWrapper = onClick
    ? ({ children }: { children: React.ReactNode }) => (
        <div onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow">
          {children}
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <Link href={`/dashboard/bitacora/${evento.id}`} className="block hover:shadow-lg transition-shadow">
          {children}
        </Link>
      )

  return (
    <CardWrapper>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {evento.vehiculos?.placa || 'Sin placa'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {evento.vehiculos?.marca} {evento.vehiculos?.modelo}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end flex-shrink-0">
              {getEstadoBadge(evento.estado)}
              <Badge className={getTipoEventoColor(evento.tipo_evento)}>
                {getTipoEventoLabel(evento.tipo_evento)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Fecha y hora */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              <FechaColombia fecha={evento.fecha} formato="fecha" />
              {' • '}
              {evento.hora_inicio}
              {evento.hora_fin && ` - ${evento.hora_fin}`}
            </span>
          </div>

          {/* Operario */}
          {evento.operarios && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{evento.operarios.nombre}</span>
            </div>
          )}

          {/* Auxiliar */}
          {evento.auxiliares && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{evento.auxiliares.nombre}</span>
            </div>
          )}

          {/* Ubicación */}
          {(evento.ubicacion_inicio || evento.ubicacion_fin) && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {evento.ubicacion_inicio && (
                  <p className="truncate text-muted-foreground">
                    Inicio: {evento.ubicacion_inicio}
                  </p>
                )}
                {evento.ubicacion_fin && (
                  <p className="truncate text-muted-foreground">
                    Fin: {evento.ubicacion_fin}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {evento.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {evento.descripcion}
            </p>
          )}

          {/* Métricas */}
          {(evento.horas_operacion || evento.kilometraje_inicio || evento.kilometraje_fin) && (
            <div className="flex gap-4 text-sm pt-2 border-t">
              {evento.horas_operacion && (
                <div>
                  <span className="text-muted-foreground">Horas: </span>
                  <span className="font-medium">{evento.horas_operacion.toFixed(1)}h</span>
                </div>
              )}
              {evento.kilometraje_inicio && evento.kilometraje_fin && (
                <div>
                  <span className="text-muted-foreground">Km: </span>
                  <span className="font-medium">
                    {evento.kilometraje_fin - evento.kilometraje_inicio}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
