import { createClient } from '@/lib/supabase/server'
import { FormularioEvento } from '@/components/bitacora/formulario-evento'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NuevoEventoPage() {
  const supabase = await createClient()

  // Obtener datos necesarios para el formulario
  const [vehiculosRes, operariosRes, auxiliaresRes] = await Promise.all([
    supabase
      .from('vehiculos')
      .select('id, placa, marca, modelo, tipo, kilometraje_actual')
      .eq('activo', true)
      .eq('estado_operativo', 'operativo')
      .order('placa'),
    supabase
      .from('operarios')
      .select('id, nombre, cedula')
      .eq('activo', true)
      .order('nombre'),
    supabase
      .from('auxiliares')
      .select('id, nombre, cedula')
      .eq('activo', true)
      .order('nombre'),
  ])

  return (
    <div className="container max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/bitacora">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Bitácora
          </Button>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nuevo Evento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registra un nuevo evento en la bitácora de operaciones
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>
            Completa los datos del evento que deseas registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioEvento
            vehiculos={vehiculosRes.data || []}
            operarios={operariosRes.data || []}
            auxiliares={auxiliaresRes.data || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
