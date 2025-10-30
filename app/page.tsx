import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, Car, Users, BarChart3 } from 'lucide-react'

export default function PaginaInicio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Inspecciones
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestión integral de inspecciones pre-operacionales, vehículos y bitácora de eventos
          </p>
        </div>

        {/* Tarjetas de características */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <ClipboardCheck className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Inspecciones</CardTitle>
              <CardDescription>
                Registro digital de inspecciones pre-operacionales
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Car className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Vehículos</CardTitle>
              <CardDescription>
                Control de flota y documentación
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Personal</CardTitle>
              <CardDescription>
                Gestión de operarios y auxiliares
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Bitácora</CardTitle>
              <CardDescription>
                Registro de eventos operacionales
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Llamada a la acción */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Comienza Ahora</CardTitle>
              <CardDescription>
                Accede al sistema para gestionar tus inspecciones
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Ir al Panel de Control
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">
                  Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
