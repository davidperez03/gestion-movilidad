import { obtenerEventoPorId } from '@/lib/actions/bitacora'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FechaColombia } from '@/components/ui/fecha-colombia'
import { CerrarEventoDialog } from '@/components/bitacora/cerrar-evento-dialog'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Truck,
  User,
  Users,
  MapPin,
  Gauge,
  Fuel,
  FileText,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EventoDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventoDetallePage({ params }: EventoDetallePageProps) {
  const { id } = await params

  try {
    const evento = await obtenerEventoPorId(id)

    if (!evento) {
      notFound()
    }

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

    return (
      <div className="container max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/bitacora">
              <Button variant="ghost" size="sm" className="gap-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Bitácora
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Detalle del Evento</h1>
            <p className="text-muted-foreground mt-1">
              Información completa del evento de bitácora
            </p>
          </div>
          <div className="flex gap-2">
            {getEstadoBadge(evento.estado)}
            <Badge className={getTipoEventoColor(evento.tipo_evento)}>
              {getTipoEventoLabel(evento.tipo_evento)}
            </Badge>
          </div>
        </div>

        {/* Información del Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Placa</p>
                <p className="font-medium text-lg">{evento.vehiculos?.placa || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{evento.vehiculos?.tipo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{evento.vehiculos?.marca || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{evento.vehiculos?.modelo || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fecha y Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fecha y Hora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  <FechaColombia fecha={evento.fecha} formato="fecha" />
                </p>
              </div>
              {evento.turno && (
                <div>
                  <p className="text-sm text-muted-foreground">Turno</p>
                  <p className="font-medium capitalize">{evento.turno}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hora Inicio</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {evento.hora_inicio}
                </p>
              </div>
              {evento.hora_fin && (
                <div>
                  <p className="text-sm text-muted-foreground">Hora Fin</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {evento.hora_fin}
                  </p>
                </div>
              )}
            </div>
            {evento.horas_operacion && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Horas de Operación</p>
                <p className="font-medium text-lg">{evento.horas_operacion.toFixed(2)} horas</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evento.operario_perfil && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Operario
                </p>
                <p className="font-medium">{evento.operario_perfil.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">{evento.operario_perfil.correo}</p>
              </div>
            )}
            {evento.auxiliar_perfil && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Auxiliar
                </p>
                <p className="font-medium">{evento.auxiliar_perfil.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">{evento.auxiliar_perfil.correo}</p>
              </div>
            )}
            {!evento.operario_perfil && !evento.auxiliar_perfil && (
              <p className="text-sm text-muted-foreground">No hay personal asignado</p>
            )}
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{evento.descripcion}</p>
          </CardContent>
        </Card>

        {/* Métricas */}
        {(evento.kilometraje_inicio || evento.combustible_inicial) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {evento.kilometraje_inicio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometraje Inicial</p>
                    <p className="font-medium text-lg">{evento.kilometraje_inicio} km</p>
                  </div>
                )}
                {evento.kilometraje_fin && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometraje Final</p>
                    <p className="font-medium text-lg">{evento.kilometraje_fin} km</p>
                  </div>
                )}
                {evento.combustible_inicial && (
                  <div>
                    <p className="text-sm text-muted-foreground">Combustible Inicial</p>
                    <p className="font-medium flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      {evento.combustible_inicial} L
                    </p>
                  </div>
                )}
                {evento.combustible_final && (
                  <div>
                    <p className="text-sm text-muted-foreground">Combustible Final</p>
                    <p className="font-medium flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      {evento.combustible_final} L
                    </p>
                  </div>
                )}
              </div>
              {evento.kilometraje_inicio && evento.kilometraje_fin && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Kilómetros Recorridos</p>
                  <p className="font-medium text-lg">
                    {evento.kilometraje_fin - evento.kilometraje_inicio} km
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ubicaciones */}
        {(evento.ubicacion_inicio || evento.ubicacion_fin) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evento.ubicacion_inicio && (
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación Inicial</p>
                  <p className="font-medium">{evento.ubicacion_inicio}</p>
                </div>
              )}
              {evento.ubicacion_fin && (
                <div className={evento.ubicacion_inicio ? 'pt-3 border-t' : ''}>
                  <p className="text-sm text-muted-foreground">Ubicación Final</p>
                  <p className="font-medium">{evento.ubicacion_fin}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {evento.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{evento.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        {evento.estado === 'activo' && (
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                Este evento está activo. Puedes cerrarlo cuando finalice la operación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CerrarEventoDialog evento={evento} />
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error al cargar evento:', error)
    notFound()
  }
}
