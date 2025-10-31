'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Truck, Users, BookOpen, Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
  { title: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Usuarios', href: '/dashboard/usuarios', icon: Users },
  { title: 'Vehículos', href: '/dashboard/vehiculos', icon: Truck },
  { title: 'Bitácora', href: '/dashboard/bitacora', icon: BookOpen },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
        setUser(profile)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b h-12 flex items-center px-4">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 -ml-1">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="ml-3 font-semibold text-sm">Inspecciones</span>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-64 bg-card border-r flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h1 className="font-semibold">Inspecciones</h1>
                {user && <p className="text-xs text-muted-foreground mt-1">{user.nombre_completo}</p>}
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-3 border-t">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-card border-r flex-col">
        <div className="p-4 border-b">
          <h1 className="font-semibold">Inspecciones</h1>
          {user && <p className="text-xs text-muted-foreground mt-1">{user.nombre_completo}</p>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-60">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card border-t h-14 flex items-center justify-around z-40">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
