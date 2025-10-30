import { obtenerTodosLosUsuarios } from '@/lib/actions/perfiles'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsuarioActions } from '@/components/usuarios/usuario-actions'
import { Users } from 'lucide-react'

export default async function UsuariosPage() {
  const usuarios = await obtenerTodosLosUsuarios()

  const getRolVariant = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'destructive'
      case 'inspector':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'administrador':
        return 'Administrador'
      case 'inspector':
        return 'Inspector'
      default:
        return 'Usuario'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los perfiles y permisos de usuarios del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Usuarios del Sistema</CardTitle>
          </div>
          <CardDescription>
            Total de usuarios: {usuarios.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        {usuario.nombre_completo}
                      </TableCell>
                      <TableCell>{usuario.correo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.telefono || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.cargo || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRolVariant(usuario.rol)}>
                          {getRolLabel(usuario.rol)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={usuario.activo ? 'default' : 'outline'}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date() && (
                            <Badge variant="destructive" className="text-xs">
                              Bloqueado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {usuario.ultimo_acceso
                          ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <UsuarioActions usuario={usuario} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
