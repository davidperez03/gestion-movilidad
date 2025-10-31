import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditarVehiculoDialog } from '@/components/vehiculos/editar-vehiculo-dialog'
import { EliminarVehiculoDialog } from '@/components/vehiculos/eliminar-vehiculo-dialog'
import { ArrowLeft, Truck, Calendar, FileText, AlertTriangle, Settings, Shield, Wrench, BookOpen, Activity } from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function VehiculoDetallePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Obtener vehículo
  const { data: vehiculo, error } = await supabase
    .from('vehiculos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !vehiculo) {
    notFound()
  }

  // Obtener eventos relacionados
  const { data: eventos, count: totalEventos } = await supabase
    .from('bitacora_eventos')
    .select('*', { count: 'exact' })
    .eq('vehiculo_id', params.id)
    .order('fecha', { ascending: false })
    .limit(5)

  // Calcular alertas
  const alertas = []
  if (vehiculo.soat_vencimiento) {
    const diasSOAT = differenceInDays(parseISO(vehiculo.soat_vencimiento), new Date())
    if (diasSOAT < 0) {
      alertas.push({ tipo: 'SOAT VENCIDO', dias: Math.abs(diasSOAT), vencido: true, color: 'red' })
    } else if (diasSOAT <= 30) {
      alertas.push({ tipo: 'SOAT POR VENCER', dias: diasSOAT, vencido: false, color: 'yellow' })
    }
  }

  if (vehiculo.tecnomecanica_vencimiento) {
    const diasTecno = differenceInDays(parseISO(vehiculo.tecnomecanica_vencimiento), new Date())
    if (diasTecno < 0) {
      alertas.push({ tipo: 'TECNOMECÁNICA VENCIDA', dias: Math.abs(diasTecno), vencido: true, color: 'red' })
    } else if (diasTecno <= 30) {
      alertas.push({ tipo: 'TECNOMECÁNICA POR VENCER', dias: diasTecno, vencido: false, color: 'yellow' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/vehiculos">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 font-semibold uppercase">
              <ArrowLeft className="h-4 w-4" />
              VOLVER
            </Button>
          </Link>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider">
                    {vehiculo.placa}
                  </h1>
                  <p className="text-lg text-blue-100 font-semibold uppercase mt-1">
                    {vehiculo.marca} {vehiculo.modelo}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`text-white font-bold px-4 py-2 text-sm uppercase ${
                    vehiculo.estado_operativo === 'operativo'
                      ? 'bg-green-500 hover:bg-green-600'
                      : vehiculo.estado_operativo === 'mantenimiento'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : vehiculo.estado_operativo === 'reparacion'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-slate-500 hover:bg-slate-600'
                  }`}
                >
                  {vehiculo.estado_operativo.toUpperCase()}
                </Badge>
                {!vehiculo.activo && (
                  <Badge variant="secondary" className="font-bold px-4 py-2 text-sm uppercase">
                    INACTIVO
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-950/20 dark:to-yellow-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100 uppercase">ALERTAS</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alertas.map((alerta, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    alerta.color === 'red'
                      ? 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800'
                      : 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800'
                  }`}
                >
                  <p className={`font-bold text-sm uppercase ${
                    alerta.color === 'red' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {alerta.tipo}
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${
                    alerta.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {alerta.vencido ? `HACE ${alerta.dias} DÍAS` : `EN ${alerta.dias} DÍAS`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del vehículo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Datos básicos */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2">
              <CardTitle className="flex items-center gap-2 text-xl uppercase">
                <FileText className="h-6 w-6 text-blue-600" />
                INFORMACIÓN BÁSICA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">PLACA:</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{vehiculo.placa}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">TIPO:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{vehiculo.tipo}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">MARCA:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{vehiculo.marca || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">MODELO:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{vehiculo.modelo || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">ESTADO:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{vehiculo.estado_operativo}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">ACTIVO:</span>
                  <Badge variant={vehiculo.activo ? 'default' : 'secondary'} className="font-bold uppercase">
                    {vehiculo.activo ? 'SÍ' : 'NO'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentación */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2">
              <CardTitle className="flex items-center gap-2 text-xl uppercase">
                <Calendar className="h-6 w-6 text-blue-600" />
                DOCUMENTACIÓN
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* SOAT */}
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-green-900 dark:text-green-100 uppercase">SOAT</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">VENCIMIENTO:</span>
                    <span className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">
                      {vehiculo.soat_vencimiento
                        ? format(parseISO(vehiculo.soat_vencimiento), 'dd MMM yyyy', { locale: es }).toUpperCase()
                        : 'NO REGISTRADO'}
                    </span>
                  </div>
                  {vehiculo.soat_aseguradora && (
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">ASEGURADORA:</span>
                      <span className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">{vehiculo.soat_aseguradora}</span>
                    </div>
                  )}
                  {vehiculo.numero_poliza_soat && (
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">PÓLIZA:</span>
                      <span className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">{vehiculo.numero_poliza_soat}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tecnomecánica */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 uppercase">TECNOMECÁNICA</h4>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">VENCIMIENTO:</span>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase">
                    {vehiculo.tecnomecanica_vencimiento
                      ? format(parseISO(vehiculo.tecnomecanica_vencimiento), 'dd MMM yyyy', { locale: es }).toUpperCase()
                      : 'NO REGISTRADO'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observaciones */}
        {vehiculo.observaciones && (
          <Card className="mb-6 border-2 shadow-xl">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2">
              <CardTitle className="flex items-center gap-2 text-xl uppercase">
                <FileText className="h-6 w-6 text-blue-600" />
                OBSERVACIONES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium uppercase">
                {vehiculo.observaciones}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Eventos recientes */}
        <Card className="mb-6 border-2 shadow-xl">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl uppercase">
                <BookOpen className="h-6 w-6 text-blue-600" />
                EVENTOS RECIENTES
                <Badge variant="secondary" className="ml-2 font-bold">
                  {totalEventos || 0}
                </Badge>
              </CardTitle>
              {totalEventos && totalEventos > 0 && (
                <Link href={`/dashboard/bitacora?vehiculo=${vehiculo.id}`}>
                  <Button variant="outline" size="sm" className="font-semibold uppercase">
                    VER TODOS
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {eventos && eventos.length > 0 ? (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <Link key={evento.id} href={`/dashboard/bitacora/${evento.id}`}>
                    <div className="border-2 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <p className="font-bold text-sm uppercase">
                              {format(parseISO(evento.fecha), 'dd MMM yyyy', { locale: es }).toUpperCase()} - {evento.turno.toUpperCase()}
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 uppercase">
                            {evento.descripcion_servicio}
                          </p>
                        </div>
                        <Badge
                          variant={evento.estado === 'activo' ? 'default' : 'secondary'}
                          className="font-bold uppercase"
                        >
                          {evento.estado}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <BookOpen className="h-12 w-12 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  NO HAY EVENTOS REGISTRADOS
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2">
            <CardTitle className="flex items-center gap-2 text-xl uppercase">
              <Settings className="h-6 w-6 text-blue-600" />
              ACCIONES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <EditarVehiculoDialog vehiculo={vehiculo}>
                <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700 font-semibold uppercase">
                  <Settings className="h-4 w-4" />
                  EDITAR VEHÍCULO
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
