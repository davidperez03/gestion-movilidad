import { obtenerTodosLosUsuarios } from '@/lib/actions/perfiles'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UsuarioActions } from '@/components/usuarios/usuario-actions'
import { CrearUsuarioDialog } from '@/components/usuarios/crear-usuario-dialog'
import { FechaColombia } from '@/components/ui/fecha-colombia'
import { Users } from 'lucide-react'
import Link from 'next/link'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los perfiles y permisos de usuarios del sistema
          </p>
        </div>
        <CrearUsuarioDialog />
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
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/usuarios/${usuario.id}`} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={usuario.url_avatar || undefined} alt={usuario.nombre_completo || ''} />
                            <AvatarFallback>
                              {usuario.nombre_completo?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{usuario.nombre_completo}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/usuarios/${usuario.id}`}>
                          {usuario.correo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Link href={`/dashboard/usuarios/${usuario.id}`}>
                          {usuario.telefono || '-'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/usuarios/${usuario.id}`}>
                          <Badge variant={getRolVariant(usuario.rol)}>
                            {getRolLabel(usuario.rol)}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/usuarios/${usuario.id}`}>
                          <div className="flex flex-col gap-1">
                            <Badge variant={usuario.activo ? 'default' : 'outline'}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta).getTime() > Date.now() && (
                              <Badge variant="destructive" className="text-xs">
                                Bloqueado
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Link href={`/dashboard/usuarios/${usuario.id}`}>
                          <FechaColombia
                            fecha={usuario.ultimo_acceso}
                            formato="relativo"
                            placeholder="Nunca"
                          />
                        </Link>
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
