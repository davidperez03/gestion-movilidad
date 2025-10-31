import { createClient } from '@/lib/supabase/server'
import { VehiculoCard } from '@/components/vehiculos/vehiculo-card'
import { FormularioVehiculo } from '@/components/vehiculos/formulario-vehiculo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Truck } from 'lucide-react'

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string }>
}) {
  const { busqueda } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('vehiculos').select('*', { count: 'exact' }).order('placa', { ascending: true })

  if (busqueda) {
    query = query.or(`placa.ilike.%${busqueda}%,marca.ilike.%${busqueda}%,modelo.ilike.%${busqueda}%`)
  }

  const { data: vehiculos, count } = await query
  const activos = vehiculos?.filter(v => v.activo).length || 0

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Content with proper margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Vehículos</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {count || 0} vehículos · {activos} activos
              </p>
            </div>
            <FormularioVehiculo>
              <Button className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo vehículo
              </Button>
            </FormularioVehiculo>
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="busqueda"
                placeholder="Buscar por placa, marca o modelo..."
                defaultValue={busqueda}
                className="pl-10 h-11 bg-card border-border shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count || 0}</p>
                <p className="text-xs text-muted-foreground">Total de vehículos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activos}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Truck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(count || 0) - activos}</p>
                <p className="text-xs text-muted-foreground">Inactivos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        {vehiculos && vehiculos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehiculos.map((vehiculo) => (
              <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Truck className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">
              {busqueda ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {busqueda ? 'Intenta con otra búsqueda' : 'Comienza agregando tu primer vehículo'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
