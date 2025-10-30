'use client'

import { useState } from 'react'
import { Perfil } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { actualizarPerfilCompleto, desbloquearUsuario } from '@/lib/actions/perfiles'
import { Edit, Loader2, Unlock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UsuarioActionsProps {
  usuario: Perfil
}

export function UsuarioActions({ usuario }: UsuarioActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nuevoRol, setNuevoRol] = useState<'usuario' | 'inspector' | 'administrador'>(usuario.rol)
  const [activo, setActivo] = useState(usuario.activo)
  const [telefono, setTelefono] = useState(usuario.telefono || '')
  const [zonaHoraria, setZonaHoraria] = useState(usuario.zona_horaria || 'America/Bogota')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Actualizar perfil completo
      await actualizarPerfilCompleto(usuario.id, {
        rol: nuevoRol,
        activo,
        telefono: telefono || null,
        zona_horaria: zonaHoraria
      })

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleDesbloquear = async () => {
    setLoading(true)
    setError(null)
    try {
      await desbloquearUsuario(usuario.id)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al desbloquear usuario')
    } finally {
      setLoading(false)
    }
  }

  const estaBloqueado = usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()

  return (
    <div className="flex gap-2 items-center justify-end">
      {estaBloqueado && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDesbloquear}
          disabled={loading}
          className="gap-2"
        >
          <Unlock className="h-4 w-4" />
          Desbloquear
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica el rol y estado de {usuario.nombre_completo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <div className="text-sm text-muted-foreground">
                {usuario.nombre_completo}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <div className="text-sm text-muted-foreground">
                {usuario.correo}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={nuevoRol}
                onValueChange={(value: 'usuario' | 'inspector' | 'administrador') => setNuevoRol(value)}
              >
                <SelectTrigger id="rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+57 300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zona">Zona Horaria</Label>
              <Select
                value={zonaHoraria}
                onValueChange={setZonaHoraria}
              >
                <SelectTrigger id="zona">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                  <SelectItem value="America/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                  <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={activo ? 'activo' : 'inactivo'}
                onValueChange={(value) => setActivo(value === 'activo')}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      </Dialog>
    </div>
  )
}
