import Link from 'next/link'
import {
  LayoutDashboard,
  Car,
  Users,
  ClipboardCheck,
  BookOpen,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    title: 'Panel Principal',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vehículos',
    href: '/dashboard/vehiculos',
    icon: Car,
  },
  {
    title: 'Personal',
    href: '/dashboard/operarios',
    icon: Users,
  },
  {
    title: 'Inspecciones',
    href: '/dashboard/inspecciones',
    icon: ClipboardCheck,
  },
  {
    title: 'Bitácora',
    href: '/dashboard/bitacora',
    icon: BookOpen,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Sistema de Inspecciones
          </h1>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard/configuracion">
              <Settings className="h-5 w-5 mr-3" />
              Configuración
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
