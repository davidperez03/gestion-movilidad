import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerRolesUsuario } from '@/lib/actions/roles-operativos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GestionRolesOperativos } from '@/components/usuarios/gestion-roles-operativos'
import { ArrowLeft, Mail, Phone, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import { FechaColombia } from '@/components/ui/fecha-colombia'

interface UsuarioDetallePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UsuarioDetallePage({ params }: UsuarioDetallePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener datos del usuario
  const { data: usuario, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !usuario) {
    notFound()
  }

  // Obtener roles operativos del usuario
  const rolesOperativos = await obtenerRolesUsuario(id)

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
    <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/usuarios">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Perfil del Usuario */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={usuario.url_avatar || undefined} alt={usuario.nombre_completo || ''} />
              <AvatarFallback className="text-2xl">
                {usuario.nombre_completo?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{usuario.nombre_completo}</CardTitle>
                <Badge variant={getRolVariant(usuario.rol)}>
                  {getRolLabel(usuario.rol)}
                </Badge>
                <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <CardDescription>
                Miembro desde <FechaColombia fecha={usuario.creado_en} formato="fecha" />
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correo */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium">{usuario.correo}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{usuario.telefono || 'No especificado'}</p>
              </div>
            </div>

            {/* Último acceso */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Último Acceso</p>
                <p className="font-medium">
                  {usuario.ultimo_acceso ? (
                    <FechaColombia fecha={usuario.ultimo_acceso} formato="completo" />
                  ) : (
                    'Nunca'
                  )}
                </p>
              </div>
            </div>

            {/* Rol del sistema */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rol del Sistema</p>
                <p className="font-medium">{getRolLabel(usuario.rol)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Roles Operativos */}
      <GestionRolesOperativos
        perfilId={usuario.id}
        rolesActuales={rolesOperativos}
      />
    </div>
  )
}
