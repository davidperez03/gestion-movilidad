'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  agregarRolOperativo,
  actualizarRolOperativo,
  desactivarRolOperativo,
  eliminarRolOperativo
} from '@/lib/actions/roles-operativos'
import type { RolOperativo } from '@/lib/types'
import { Plus, Edit2, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GestionRolesOperativosProps {
  perfilId: string
  rolesActuales: RolOperativo[]
}

const ROLES = {
  operario: { label: 'Operario', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  auxiliar: { label: 'Auxiliar', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  inspector: { label: 'Inspector', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
} as const

const CATEGORIAS_LICENCIA = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']

export function GestionRolesOperativos({ perfilId, rolesActuales }: GestionRolesOperativosProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState<'agregar' | 'editar'>('agregar')
  const [rolSeleccionado, setRolSeleccionado] = useState<RolOperativo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    rol: 'operario' as 'operario' | 'auxiliar' | 'inspector',
    licencia_conduccion: '',
    categoria_licencia: '',
    licencia_vencimiento: '',
  })

  const handleAbrirDialogo = (modo: 'agregar' | 'editar', rol?: RolOperativo) => {
    setModoEdicion(modo)
    if (modo === 'editar' && rol) {
      setRolSeleccionado(rol)
      setFormData({
        rol: rol.rol,
        licencia_conduccion: rol.licencia_conduccion || '',
        categoria_licencia: rol.categoria_licencia || '',
        licencia_vencimiento: rol.licencia_vencimiento || '',
      })
    } else {
      setRolSeleccionado(null)
      setFormData({
        rol: 'operario',
        licencia_conduccion: '',
        categoria_licencia: '',
        licencia_vencimiento: '',
      })
    }
    setError(null)
    setDialogAbierto(true)
  }

  const handleGuardar = async () => {
    setError(null)
    setLoading(true)

    try {
      if (modoEdicion === 'agregar') {
        await agregarRolOperativo({
          perfil_id: perfilId,
          rol: formData.rol,
          licencia_conduccion: formData.licencia_conduccion || undefined,
          categoria_licencia: formData.categoria_licencia || undefined,
          licencia_vencimiento: formData.licencia_vencimiento || undefined,
        })
      } else if (rolSeleccionado) {
        await actualizarRolOperativo(rolSeleccionado.id, {
          licencia_conduccion: formData.licencia_conduccion || undefined,
          categoria_licencia: formData.categoria_licencia || undefined,
          licencia_vencimiento: formData.licencia_vencimiento || undefined,
        })
      }

      setDialogAbierto(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al guardar rol')
    } finally {
      setLoading(false)
    }
  }

  const handleDesactivar = async (rolId: string) => {
    if (!confirm('¿Estás seguro de desactivar este rol?')) return

    setLoading(true)
    try {
      await desactivarRolOperativo(rolId)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error al desactivar rol')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (rolId: string) => {
    if (!confirm('¿Estás seguro de eliminar este rol? Esta acción no se puede deshacer.')) return

    setLoading(true)
    try {
      await eliminarRolOperativo(rolId)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error al eliminar rol')
    } finally {
      setLoading(false)
    }
  }

  const rolesDisponibles = (['operario', 'auxiliar', 'inspector'] as const).filter(
    rol => !rolesActuales.some(r => r.rol === rol && r.activo)
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles Operativos</CardTitle>
              <CardDescription>
                Gestiona los roles operativos del usuario
              </CardDescription>
            </div>
            {rolesDisponibles.length > 0 && (
              <Button onClick={() => handleAbrirDialogo('agregar')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Rol
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rolesActuales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay roles operativos asignados
            </p>
          ) : (
            <div className="space-y-3">
              {rolesActuales.map((rol) => (
                <div
                  key={rol.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={ROLES[rol.rol].color}>
                        {ROLES[rol.rol].label}
                      </Badge>
                      <Badge variant={rol.activo ? 'default' : 'secondary'}>
                        {rol.activo ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </div>

                    {rol.rol === 'operario' && (
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {rol.licencia_conduccion && (
                          <p>Licencia: {rol.licencia_conduccion}</p>
                        )}
                        {rol.categoria_licencia && (
                          <p>Categoría: {rol.categoria_licencia}</p>
                        )}
                        {rol.licencia_vencimiento && (
                          <p>Vencimiento: {new Date(rol.licencia_vencimiento).toLocaleDateString('es-CO')}</p>
                        )}
                      </div>
                    )}

                    {!rol.activo && rol.motivo_inactivacion && (
                      <p className="text-sm text-muted-foreground">
                        Motivo: {rol.motivo_inactivacion}
                      </p>
                    )}
                  </div>

                  {rol.activo && (
                    <div className="flex gap-1">
                      {rol.rol === 'operario' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirDialogo('editar', rol)}
                          disabled={loading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDesactivar(rol.id)}
                        disabled={loading}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminar(rol.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicion === 'agregar' ? 'Agregar Rol Operativo' : 'Editar Rol Operativo'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicion === 'agregar'
                ? 'Asigna un nuevo rol operativo al usuario'
                : 'Actualiza la información del rol operativo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            {modoEdicion === 'agregar' && (
              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: any) => setFormData({ ...formData, rol: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesDisponibles.map((rol) => (
                      <SelectItem key={rol} value={rol}>
                        {ROLES[rol].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(formData.rol === 'operario' || rolSeleccionado?.rol === 'operario') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="licencia">
                    Número de Licencia {modoEdicion === 'agregar' && '*'}
                  </Label>
                  <Input
                    id="licencia"
                    value={formData.licencia_conduccion}
                    onChange={(e) => setFormData({ ...formData, licencia_conduccion: e.target.value })}
                    placeholder="Ej: 123456789"
                    required={modoEdicion === 'agregar'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria_licencia}
                    onValueChange={(value) => setFormData({ ...formData, categoria_licencia: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_LICENCIA.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vencimiento">Vencimiento de Licencia</Label>
                  <Input
                    id="vencimiento"
                    type="date"
                    value={formData.licencia_vencimiento}
                    onChange={(e) => setFormData({ ...formData, licencia_vencimiento: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAbierto(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
