import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Car,
  Users,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'

export default async function DashboardPage() {
  // TODO: Obtener datos reales de Supabase
  const estadisticas = {
    totalVehiculos: 15,
    vehiculosOperativos: 12,
    vehiculosMantenimiento: 2,
    vehiculosInactivos: 1,
    totalOperarios: 25,
    operariosActivos: 22,
    inspeccionesHoy: 8,
    inspeccionesMes: 142,
    vehiculosAptos: 10,
    vehiculosNoAptos: 2,
    documentosPorVencer: 3,
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al sistema de gestión de inspecciones
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/inspecciones/nueva">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Nueva Inspección
          </Link>
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehículos
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalVehiculos}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.vehiculosOperativos} operativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personal Activo
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalOperarios}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.operariosActivos} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inspecciones Hoy
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.inspeccionesHoy}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.inspeccionesMes} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos por Vencer
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {estadisticas.documentosPorVencer}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de estado de flota e inspecciones */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Estado de la flota */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de la Flota</CardTitle>
            <CardDescription>
              Distribución actual de vehículos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Operativos</span>
              </div>
              <span className="text-sm font-medium">{estadisticas.vehiculosOperativos}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">En Mantenimiento</span>
              </div>
              <span className="text-sm font-medium">{estadisticas.vehiculosMantenimiento}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="text-sm">Inactivos</span>
              </div>
              <span className="text-sm font-medium">{estadisticas.vehiculosInactivos}</span>
            </div>
          </CardContent>
        </Card>

        {/* Resultado de inspecciones */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado de Inspecciones</CardTitle>
            <CardDescription>
              Última semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Vehículos Aptos</span>
              </div>
              <span className="text-sm font-medium">{estadisticas.vehiculosAptos}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm">Vehículos No Aptos</span>
              </div>
              <span className="text-sm font-medium">{estadisticas.vehiculosNoAptos}</span>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/inspecciones">
                  Ver Todas las Inspecciones
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/dashboard/vehiculos/nuevo">
              <Car className="h-6 w-6 mb-2" />
              <span>Registrar Vehículo</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/dashboard/operarios/nuevo">
              <Users className="h-6 w-6 mb-2" />
              <span>Registrar Operario</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/dashboard/bitacora/nuevo">
              <Clock className="h-6 w-6 mb-2" />
              <span>Nuevo Evento</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
