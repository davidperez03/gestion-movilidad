import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditarVehiculoDialog } from '@/components/vehiculos/editar-vehiculo-dialog'
import { EliminarVehiculoDialog } from '@/components/vehiculos/eliminar-vehiculo-dialog'
import { ArrowLeft, Calendar, FileText, AlertTriangle, Settings, Shield, Wrench, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function VehiculoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehiculo, error } = await supabase
    .from('vehiculos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehiculo) {
    notFound()
  }

  const { data: eventos, count: totalEventos } = await supabase
    .from('bitacora_eventos')
    .select('*', { count: 'exact' })
    .eq('vehiculo_id', params.id)
    .order('fecha', { ascending: false })
    .limit(5)

  // Calcular alertas
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
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Back Button */}
        <Link href="/dashboard/vehiculos">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{vehiculo.placa}</h1>
              {(vehiculo.marca || vehiculo.modelo) && (
                <p className="text-lg text-muted-foreground mt-2">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
              )}
            </div>
            <Badge variant={vehiculo.activo ? 'default' : 'secondary'} className="text-sm px-4 py-1">
              {vehiculo.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900 dark:text-red-200">Alertas</h3>
            </div>
            <div className="space-y-2">
              {alertas.map((alerta, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-red-700 dark:text-red-300 font-medium">{alerta.tipo}</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">{alerta.dias} días</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Información Básica */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Placa</span>
                <span className="font-semibold">{vehiculo.placa}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <span className="font-medium">{vehiculo.tipo}</span>
              </div>
              {vehiculo.marca && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Marca</span>
                  <span className="font-medium">{vehiculo.marca}</span>
                </div>
              )}
              {vehiculo.modelo && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Modelo</span>
                  <span className="font-medium">{vehiculo.modelo}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={vehiculo.activo ? 'default' : 'secondary'}>
                  {vehiculo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Documentación */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Documentación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* SOAT */}
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-200">SOAT</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Vencimiento</span>
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {vehiculo.soat_vencimiento
                        ? format(parseISO(vehiculo.soat_vencimiento), 'dd MMM yyyy', { locale: es })
                        : 'No registrado'}
                    </span>
                  </div>
                  {vehiculo.soat_aseguradora && (
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Aseguradora</span>
                      <span className="font-medium text-green-900 dark:text-green-100">{vehiculo.soat_aseguradora}</span>
                    </div>
                  )}
                  {vehiculo.numero_poliza_soat && (
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-300">Póliza</span>
                      <span className="font-medium text-green-900 dark:text-green-100">{vehiculo.numero_poliza_soat}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tecnomecánica */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200">Tecnomecánica</h4>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Vencimiento</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {vehiculo.tecnomecanica_vencimiento
                      ? format(parseISO(vehiculo.tecnomecanica_vencimiento), 'dd MMM yyyy', { locale: es })
                      : 'No registrado'}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Observaciones */}
        {vehiculo.observaciones && (
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vehiculo.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {/* Eventos Recientes */}
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Eventos Recientes
                <Badge variant="secondary" className="ml-2">{totalEventos || 0}</Badge>
              </CardTitle>
              {totalEventos && totalEventos > 0 && (
                <Link href={`/dashboard/bitacora?vehiculo=${vehiculo.id}`}>
                  <Button variant="outline" size="sm">Ver todos</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {eventos && eventos.length > 0 ? (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <Link key={evento.id} href={`/dashboard/bitacora/${evento.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {format(parseISO(evento.fecha), 'dd MMM yyyy', { locale: es })} · {evento.turno}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {evento.descripcion_servicio}
                          </p>
                        </div>
                        <Badge variant={evento.estado === 'activo' ? 'default' : 'secondary'}>
                          {evento.estado}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay eventos registrados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <EditarVehiculoDialog vehiculo={vehiculo}>
                <Button variant="default">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar vehículo
                </Button>
              </EditarVehiculoDialog>
              <EliminarVehiculoDialog vehiculoId={vehiculo.id} vehiculoPlaca={vehiculo.placa} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
