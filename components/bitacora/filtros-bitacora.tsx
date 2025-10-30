'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TIPOS_EVENTO, ESTADOS_EVENTO, type Vehiculo } from '@/lib/types'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface FiltrosBitacoraProps {
  vehiculos?: Vehiculo[]
  filtros: {
    vehiculoId?: string
    estado?: string
    tipoEvento?: string
    fechaInicio?: string
    fechaFin?: string
  }
  onFiltrosChange: (filtros: any) => void
}

export function FiltrosBitacora({
  vehiculos = [],
  filtros,
  onFiltrosChange,
}: FiltrosBitacoraProps) {
  const [open, setOpen] = useState(false)
  const [filtrosTemp, setFiltrosTemp] = useState(filtros)

  const handleAplicar = () => {
    onFiltrosChange(filtrosTemp)
    setOpen(false)
  }

  const handleLimpiar = () => {
    const filtrosVacios = {
      vehiculoId: undefined,
      estado: undefined,
      tipoEvento: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
    }
    setFiltrosTemp(filtrosVacios)
    onFiltrosChange(filtrosVacios)
  }

  const cantidadFiltrosActivos = Object.values(filtros).filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {cantidadFiltrosActivos > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {cantidadFiltrosActivos}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtrar eventos</SheetTitle>
          <SheetDescription>
            Aplica filtros para encontrar eventos específicos
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Vehículo */}
          <div className="space-y-2">
            <Label htmlFor="vehiculo">Vehículo</Label>
            <Select
              value={filtrosTemp.vehiculoId || 'todos'}
              onValueChange={(value) =>
                setFiltrosTemp({
                  ...filtrosTemp,
                  vehiculoId: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="vehiculo">
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los vehículos</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filtrosTemp.estado || 'todos'}
              onValueChange={(value) =>
                setFiltrosTemp({
                  ...filtrosTemp,
                  estado: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value={ESTADOS_EVENTO.ACTIVO}>Activo</SelectItem>
                <SelectItem value={ESTADOS_EVENTO.CERRADO}>Cerrado</SelectItem>
                <SelectItem value={ESTADOS_EVENTO.CANCELADO}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de evento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de evento</Label>
            <Select
              value={filtrosTemp.tipoEvento || 'todos'}
              onValueChange={(value) =>
                setFiltrosTemp({
                  ...filtrosTemp,
                  tipoEvento: value === 'todos' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value={TIPOS_EVENTO.OPERACION}>Operación</SelectItem>
                <SelectItem value={TIPOS_EVENTO.MANTENIMIENTO}>Mantenimiento</SelectItem>
                <SelectItem value={TIPOS_EVENTO.FALLA}>Falla</SelectItem>
                <SelectItem value={TIPOS_EVENTO.INACTIVO}>Inactivo</SelectItem>
                <SelectItem value={TIPOS_EVENTO.TRASLADO}>Traslado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={filtrosTemp.fechaInicio || ''}
              onChange={(e) =>
                setFiltrosTemp({
                  ...filtrosTemp,
                  fechaInicio: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Fecha fin */}
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={filtrosTemp.fechaFin || ''}
              onChange={(e) =>
                setFiltrosTemp({
                  ...filtrosTemp,
                  fechaFin: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleLimpiar}
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
          <Button className="flex-1" onClick={handleAplicar}>
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
