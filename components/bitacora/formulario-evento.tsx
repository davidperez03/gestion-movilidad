'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { crearEventoBitacora } from '@/lib/actions/bitacora'
import { TIPOS_EVENTO, TURNOS, type Vehiculo, type Operario, type Auxiliar } from '@/lib/types'
import { Loader2, Save } from 'lucide-react'

interface FormularioEventoProps {
  vehiculos: Array<Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'modelo' | 'tipo' | 'kilometraje_actual'>>
  operarios: Array<Pick<Operario, 'id' | 'nombre' | 'cedula'>>
  auxiliares: Array<Pick<Auxiliar, 'id' | 'nombre' | 'cedula'>>
}

export function FormularioEvento({
  vehiculos,
  operarios,
  auxiliares,
}: FormularioEventoProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener fecha y hora actual para valores por defecto
  const ahora = new Date()
  const fechaHoy = ahora.toISOString().split('T')[0]
  const horaActual = ahora.toTimeString().slice(0, 5)

  const [formData, setFormData] = useState({
    vehiculo_id: '',
    operario_id: '',
    auxiliar_id: '',
    fecha: fechaHoy,
    hora_inicio: horaActual,
    tipo_evento: 'operacion' as const,
    descripcion: '',
    turno: null as string | null,
    kilometraje_inicio: null as number | null,
    combustible_inicial: null as number | null,
    ubicacion_inicio: '',
    observaciones: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validaciones
      if (!formData.vehiculo_id) {
        throw new Error('Debes seleccionar un vehículo')
      }
      if (!formData.tipo_evento) {
        throw new Error('Debes seleccionar un tipo de evento')
      }
      if (!formData.descripcion.trim()) {
        throw new Error('Debes ingresar una descripción')
      }

      await crearEventoBitacora({
        vehiculo_id: formData.vehiculo_id,
        operario_id: formData.operario_id || null,
        auxiliar_id: formData.auxiliar_id || null,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        tipo_evento: formData.tipo_evento,
        descripcion: formData.descripcion,
        turno: formData.turno as any,
        kilometraje_inicio: formData.kilometraje_inicio,
        combustible_inicial: formData.combustible_inicial,
        ubicacion_inicio: formData.ubicacion_inicio || null,
        observaciones: formData.observaciones || null,
        estado: 'activo',
        hora_fin: null,
        horas_operacion: null,
        kilometraje_fin: null,
        combustible_final: null,
        ubicacion_fin: null,
        adjuntos: null,
      })

      router.push('/dashboard/bitacora')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear evento')
    } finally {
      setLoading(false)
    }
  }

  // Autocompletar kilometraje del vehículo seleccionado
  const handleVehiculoChange = (vehiculoId: string) => {
    setFormData({ ...formData, vehiculo_id: vehiculoId })

    const vehiculo = vehiculos.find((v) => v.id === vehiculoId)
    if (vehiculo?.kilometraje_actual) {
      setFormData((prev) => ({
        ...prev,
        vehiculo_id: vehiculoId,
        kilometraje_inicio: vehiculo.kilometraje_actual,
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          {error}
        </div>
      )}

      {/* Vehículo - REQUERIDO */}
      <div className="space-y-2">
        <Label htmlFor="vehiculo" className="required">
          Vehículo <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.vehiculo_id}
          onValueChange={handleVehiculoChange}
          required
        >
          <SelectTrigger id="vehiculo">
            <SelectValue placeholder="Selecciona un vehículo" />
          </SelectTrigger>
          <SelectContent>
            {vehiculos.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No hay vehículos disponibles
              </div>
            ) : (
              vehiculos.map((vehiculo) => (
                <SelectItem key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.tipo})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Evento - REQUERIDO */}
      <div className="space-y-2">
        <Label htmlFor="tipo" className="required">
          Tipo de Evento <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.tipo_evento}
          onValueChange={(value) =>
            setFormData({ ...formData, tipo_evento: value as any })
          }
          required
        >
          <SelectTrigger id="tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TIPOS_EVENTO.OPERACION}>Operación</SelectItem>
            <SelectItem value={TIPOS_EVENTO.MANTENIMIENTO}>Mantenimiento</SelectItem>
            <SelectItem value={TIPOS_EVENTO.FALLA}>Falla</SelectItem>
            <SelectItem value={TIPOS_EVENTO.INACTIVO}>Inactivo</SelectItem>
            <SelectItem value={TIPOS_EVENTO.TRASLADO}>Traslado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha <span className="text-red-500">*</span></Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            max={fechaHoy}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_inicio">Hora Inicio <span className="text-red-500">*</span></Label>
          <Input
            id="hora_inicio"
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Descripción - REQUERIDO */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="descripcion"
          placeholder="Describe brevemente el evento..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={3}
          required
        />
      </div>

      {/* Operario */}
      <div className="space-y-2">
        <Label htmlFor="operario">Operario</Label>
        <Select
          value={formData.operario_id}
          onValueChange={(value) => setFormData({ ...formData, operario_id: value })}
        >
          <SelectTrigger id="operario">
            <SelectValue placeholder="Selecciona un operario (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin operario</SelectItem>
            {operarios.map((operario) => (
              <SelectItem key={operario.id} value={operario.id}>
                {operario.nombre} - {operario.cedula}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Auxiliar */}
      <div className="space-y-2">
        <Label htmlFor="auxiliar">Auxiliar</Label>
        <Select
          value={formData.auxiliar_id}
          onValueChange={(value) => setFormData({ ...formData, auxiliar_id: value })}
        >
          <SelectTrigger id="auxiliar">
            <SelectValue placeholder="Selecciona un auxiliar (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin auxiliar</SelectItem>
            {auxiliares.map((auxiliar) => (
              <SelectItem key={auxiliar.id} value={auxiliar.id}>
                {auxiliar.nombre} - {auxiliar.cedula}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Turno */}
      <div className="space-y-2">
        <Label htmlFor="turno">Turno</Label>
        <Select
          value={formData.turno || ''}
          onValueChange={(value) =>
            setFormData({ ...formData, turno: value || null })
          }
        >
          <SelectTrigger id="turno">
            <SelectValue placeholder="Selecciona turno (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin turno</SelectItem>
            <SelectItem value={TURNOS.DIURNO}>Diurno</SelectItem>
            <SelectItem value={TURNOS.NOCTURNO}>Nocturno</SelectItem>
            <SelectItem value={TURNOS.COMPLETO}>Completo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kilometraje">Kilometraje Inicial</Label>
          <Input
            id="kilometraje"
            type="number"
            min="0"
            placeholder="Km"
            value={formData.kilometraje_inicio || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                kilometraje_inicio: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="combustible">Combustible Inicial</Label>
          <Input
            id="combustible"
            type="number"
            min="0"
            step="0.01"
            placeholder="Litros"
            value={formData.combustible_inicial || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                combustible_inicial: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <Label htmlFor="ubicacion">Ubicación Inicial</Label>
        <Input
          id="ubicacion"
          placeholder="Ej: Yopal, Calle 10 #5-23"
          value={formData.ubicacion_inicio}
          onChange={(e) =>
            setFormData({ ...formData, ubicacion_inicio: e.target.value })
          }
        />
      </div>

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          placeholder="Observaciones adicionales..."
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          rows={2}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Crear Evento
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
