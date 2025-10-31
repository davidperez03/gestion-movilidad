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
import { cerrarEventoBitacora } from '@/lib/actions/bitacora'
import type { BitacoraEvento } from '@/lib/types'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface CerrarEventoDialogProps {
  evento: BitacoraEvento
}

export function CerrarEventoDialog({ evento }: CerrarEventoDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener hora actual para valor por defecto
  const horaActual = new Date().toTimeString().slice(0, 5)

  const [formData, setFormData] = useState({
    hora_fin: horaActual,
    observaciones: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validaciones
      if (!formData.hora_fin) {
        throw new Error('Debes ingresar la hora de finalización')
      }

      await cerrarEventoBitacora(evento.id, {
        hora_fin: formData.hora_fin,
        observaciones: formData.observaciones || undefined,
      })

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al cerrar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full">
          <CheckCircle2 className="h-4 w-4" />
          Cerrar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cerrar Evento</DialogTitle>
          <DialogDescription>
            Completa los datos finales del evento para cerrarlo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          {/* Hora de finalización */}
          <div className="space-y-2">
            <Label htmlFor="hora_fin">
              Hora de Finalización <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hora_fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Inicio: {evento.hora_inicio}
            </p>
          </div>

          {/* Observaciones finales */}
          <div className="space-y-2">
            <Label htmlFor="observaciones_cierre">Observaciones Finales</Label>
            <Textarea
              id="observaciones_cierre"
              placeholder="Observaciones al cerrar el evento..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Cerrar Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
