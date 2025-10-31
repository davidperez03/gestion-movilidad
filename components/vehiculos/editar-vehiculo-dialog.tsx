'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { actualizarVehiculo } from '@/lib/actions/vehiculos'
import type { Vehiculo } from '@/lib/types'
import { Loader2, Edit, Truck, Shield, Wrench, Power } from 'lucide-react'

interface EditarVehiculoDialogProps {
  vehiculo: Vehiculo
  children?: React.ReactNode
}

export function EditarVehiculoDialog({ vehiculo, children }: EditarVehiculoDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    placa: vehiculo.placa,
    marca: vehiculo.marca || '',
    modelo: vehiculo.modelo || '',
    estado_operativo: vehiculo.estado_operativo,
    activo: vehiculo.activo,
    soat_vencimiento: vehiculo.soat_vencimiento || '',
    tecnomecanica_vencimiento: vehiculo.tecnomecanica_vencimiento || '',
    soat_aseguradora: vehiculo.soat_aseguradora || '',
    numero_poliza_soat: vehiculo.numero_poliza_soat || '',
    observaciones: vehiculo.observaciones || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.placa.trim()) {
        throw new Error('La placa es obligatoria')
      }

      await actualizarVehiculo(vehiculo.id, {
        placa: formData.placa !== vehiculo.placa ? formData.placa : undefined,
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        estado_operativo: formData.estado_operativo !== vehiculo.estado_operativo
          ? (formData.estado_operativo as 'operativo' | 'mantenimiento' | 'reparacion' | 'inactivo')
          : undefined,
        activo: formData.activo !== vehiculo.activo ? formData.activo : undefined,
        soat_vencimiento: formData.soat_vencimiento || undefined,
        tecnomecanica_vencimiento: formData.tecnomecanica_vencimiento || undefined,
        soat_aseguradora: formData.soat_aseguradora || undefined,
        numero_poliza_soat: formData.numero_poliza_soat || undefined,
        observaciones: formData.observaciones || undefined,
      })

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar vehículo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 font-semibold uppercase">
            <Edit className="h-4 w-4" />
            EDITAR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl uppercase">EDITAR VEHÍCULO</DialogTitle>
              <DialogDescription className="text-base">
                Actualiza la información del vehículo {vehiculo.placa}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Truck className="h-5 w-5" />
              INFORMACIÓN BÁSICA
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa" className="text-sm font-bold uppercase">
                  PLACA <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  placeholder="ABC123"
                  required
                  className="uppercase font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca" className="text-sm font-bold uppercase">
                  MARCA
                </Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value.toUpperCase() })}
                  placeholder="TOYOTA, CHEVROLET, ETC."
                  className="uppercase"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modelo" className="text-sm font-bold uppercase">
                  MODELO
                </Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value.toUpperCase() })}
                  placeholder="HILUX, NHR, ETC."
                  className="uppercase"
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Power className="h-5 w-5" />
              ESTADO DEL VEHÍCULO
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado_operativo" className="text-sm font-bold uppercase">
                  ESTADO OPERATIVO
                </Label>
                <Select
                  value={formData.estado_operativo}
                  onValueChange={(value) => setFormData({ ...formData, estado_operativo: value })}
                >
                  <SelectTrigger id="estado_operativo" className="uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operativo">OPERATIVO</SelectItem>
                    <SelectItem value="mantenimiento">MANTENIMIENTO</SelectItem>
                    <SelectItem value="reparacion">REPARACIÓN</SelectItem>
                    <SelectItem value="inactivo">INACTIVO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activo" className="text-sm font-bold uppercase">
                  ACTIVO
                </Label>
                <div className="flex items-center space-x-3 h-10 px-3 border-2 rounded-lg bg-white dark:bg-slate-950">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                  />
                  <span className="text-sm font-semibold uppercase">
                    {formData.activo ? 'SÍ' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documentación SOAT */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 uppercase flex items-center gap-2">
              <Shield className="h-5 w-5" />
              SOAT
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soat_aseguradora" className="text-sm font-bold uppercase">
                  ASEGURADORA
                </Label>
                <Input
                  id="soat_aseguradora"
                  value={formData.soat_aseguradora}
                  onChange={(e) => setFormData({ ...formData, soat_aseguradora: e.target.value.toUpperCase() })}
                  placeholder="NOMBRE DE LA ASEGURADORA"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_poliza_soat" className="text-sm font-bold uppercase">
                  NÚMERO DE PÓLIZA
                </Label>
                <Input
                  id="numero_poliza_soat"
                  value={formData.numero_poliza_soat}
                  onChange={(e) => setFormData({ ...formData, numero_poliza_soat: e.target.value.toUpperCase() })}
                  placeholder="NÚMERO DE PÓLIZA"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="soat_vencimiento" className="text-sm font-bold uppercase">
                  FECHA DE VENCIMIENTO
                </Label>
                <Input
                  id="soat_vencimiento"
                  type="date"
                  value={formData.soat_vencimiento}
                  onChange={(e) => setFormData({ ...formData, soat_vencimiento: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Documentación Tecnomecánica */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 uppercase flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              TECNOMECÁNICA
            </h3>
            <div className="space-y-2">
              <Label htmlFor="tecnomecanica_vencimiento" className="text-sm font-bold uppercase">
                FECHA DE VENCIMIENTO
              </Label>
              <Input
                id="tecnomecanica_vencimiento"
                type="date"
                value={formData.tecnomecanica_vencimiento}
                onChange={(e) => setFormData({ ...formData, tecnomecanica_vencimiento: e.target.value })}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-bold uppercase">
              OBSERVACIONES
            </Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value.toUpperCase() })}
              placeholder="OBSERVACIONES ADICIONALES SOBRE EL VEHÍCULO..."
              rows={3}
              className="uppercase resize-none"
            />
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="font-semibold uppercase"
            >
              CANCELAR
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 bg-blue-600 hover:bg-blue-700 font-semibold uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  GUARDANDO...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  GUARDAR CAMBIOS
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
