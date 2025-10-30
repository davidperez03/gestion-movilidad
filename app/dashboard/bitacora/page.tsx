import { obtenerEventosBitacora } from '@/lib/actions/bitacora'
import { createClient } from '@/lib/supabase/server'
import { EventoCard } from '@/components/bitacora/evento-card'
import { FiltrosBitacoraClient } from '@/components/bitacora/filtros-bitacora-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

interface BitacoraPageProps {
  searchParams: Promise<{
    pagina?: string
    vehiculoId?: string
    estado?: string
    tipoEvento?: string
    fechaInicio?: string
    fechaFin?: string
  }>
}

export default async function BitacoraPage({ searchParams }: BitacoraPageProps) {
  const params = await searchParams
  const pagina = Number(params.pagina) || 1

  // Obtener eventos con filtros
  const { eventos, total, totalPaginas } = await obtenerEventosBitacora({
    pagina,
    limite: 20,
    vehiculoId: params.vehiculoId,
    estado: params.estado,
    tipoEvento: params.tipoEvento,
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
  })

  // Obtener vehículos para el filtro
  const supabase = await createClient()
  const { data: vehiculos } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo, tipo')
    .eq('activo', true)
    .order('placa')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 border-b bg-background sticky top-0 z-10 px-4 pt-4 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bitácora de Eventos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registro de operaciones y eventos de vehículos
            </p>
          </div>
          <Link href="/dashboard/bitacora/nuevo" className="md:hidden">
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
          <Link href="/dashboard/bitacora/nuevo" className="hidden md:block">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </Link>
        </div>

        {/* Filtros y stats */}
        <div className="flex items-center justify-between gap-2">
          <FiltrosBitacoraClient
            vehiculos={vehiculos || []}
            filtrosIniciales={{
              vehiculoId: params.vehiculoId,
              estado: params.estado,
              tipoEvento: params.tipoEvento,
              fechaInicio: params.fechaInicio,
              fechaFin: params.fechaFin,
            }}
          />

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{total}</span> evento{total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {eventos.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No hay eventos registrados</CardTitle>
              <CardDescription>
                {Object.values(params).some(Boolean)
                  ? 'No se encontraron eventos con los filtros aplicados'
                  : 'Comienza registrando tu primer evento en la bitácora'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Link href="/dashboard/bitacora/nuevo">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Evento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Link
              href={`/dashboard/bitacora?pagina=${pagina - 1}${
                params.vehiculoId ? `&vehiculoId=${params.vehiculoId}` : ''
              }${params.estado ? `&estado=${params.estado}` : ''}${
                params.tipoEvento ? `&tipoEvento=${params.tipoEvento}` : ''
              }${params.fechaInicio ? `&fechaInicio=${params.fechaInicio}` : ''}${
                params.fechaFin ? `&fechaFin=${params.fechaFin}` : ''
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={pagina <= 1}
              >
                Anterior
              </Button>
            </Link>

            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </span>

            <Link
              href={`/dashboard/bitacora?pagina=${pagina + 1}${
                params.vehiculoId ? `&vehiculoId=${params.vehiculoId}` : ''
              }${params.estado ? `&estado=${params.estado}` : ''}${
                params.tipoEvento ? `&tipoEvento=${params.tipoEvento}` : ''
              }${params.fechaInicio ? `&fechaInicio=${params.fechaInicio}` : ''}${
                params.fechaFin ? `&fechaFin=${params.fechaFin}` : ''
              }`}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={pagina >= totalPaginas}
              >
                Siguiente
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Botón flotante para móvil */}
      <Link
        href="/dashboard/bitacora/nuevo"
        className="md:hidden fixed bottom-6 right-6 z-50"
      >
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
