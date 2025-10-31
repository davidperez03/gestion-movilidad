import { createClient } from '@/lib/supabase/server'
import { VehiculoCard } from '@/components/vehiculos/vehiculo-card'
import { FormularioVehiculo } from '@/components/vehiculos/formulario-vehiculo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Plus, Search, Filter } from 'lucide-react'

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: { busqueda?: string; estado?: string; activo?: string }
}) {
  const supabase = await createClient()

  // Construir query base
  let query = supabase
    .from('vehiculos')
    .select('*', { count: 'exact' })
    .order('placa', { ascending: true })

  // Aplicar filtros
  if (searchParams.busqueda) {
    query = query.or(
      `placa.ilike.%${searchParams.busqueda}%,marca.ilike.%${searchParams.busqueda}%,modelo.ilike.%${searchParams.busqueda}%`
    )
  }

  if (searchParams.estado && searchParams.estado !== 'todos') {
    query = query.eq('estado_operativo', searchParams.estado)
  }

  if (searchParams.activo && searchParams.activo !== 'todos') {
    query = query.eq('activo', searchParams.activo === 'true')
  }

  const { data: vehiculos, error, count } = await query

  if (error) {
    console.error('Error al obtener vehículos:', error)
  }

  // Calcular estadísticas
  const totalVehiculos = count || 0
  const operativos = vehiculos?.filter((v) => v.estado_operativo === 'operativo' && v.activo).length || 0
  const mantenimiento = vehiculos?.filter((v) => v.estado_operativo === 'mantenimiento').length || 0
  const inactivos = vehiculos?.filter((v) => !v.activo || v.estado_operativo === 'inactivo').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Truck className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    VEHÍCULOS
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                    Gestión de flota de grúas
                  </p>
                </div>
              </div>
            </div>
            <FormularioVehiculo>
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-5 w-5" />
                <span className="font-semibold">AGREGAR VEHÍCULO</span>
              </Button>
            </FormularioVehiculo>
          </div>
        </div>

        {/* Estadísticas Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  TOTAL
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                  {totalVehiculos}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                  OPERATIVOS
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 dark:text-green-400">
                  {operativos}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                  MANTENIMIENTO
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-700 dark:text-yellow-400">
                  {mantenimiento}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  INACTIVOS
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 dark:text-slate-400">
                  {inactivos}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Section */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white uppercase">FILTROS</h3>
            </div>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    name="busqueda"
                    placeholder="PLACA, MARCA, MODELO..."
                    defaultValue={searchParams.busqueda}
                    className="pl-10 uppercase placeholder:normal-case"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Estado Operativo
                </label>
                <Select name="estado" defaultValue={searchParams.estado || 'todos'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">TODOS</SelectItem>
                    <SelectItem value="operativo">OPERATIVO</SelectItem>
                    <SelectItem value="mantenimiento">MANTENIMIENTO</SelectItem>
                    <SelectItem value="reparacion">REPARACIÓN</SelectItem>
                    <SelectItem value="inactivo">INACTIVO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Estado
                </label>
                <Select name="activo" defaultValue={searchParams.activo || 'todos'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">TODOS</SelectItem>
                    <SelectItem value="true">ACTIVOS</SelectItem>
                    <SelectItem value="false">INACTIVOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <Button type="submit" className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4" />
                  BUSCAR
                </Button>
                <Button type="reset" variant="outline" className="flex-1">
                  LIMPIAR
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de vehículos */}
        {vehiculos && vehiculos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {vehiculos.map((vehiculo) => (
              <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Truck className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />
              </div>
              <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-400 uppercase">
                NO SE ENCONTRARON VEHÍCULOS
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
