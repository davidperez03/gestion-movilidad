'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth/actions'

export function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5 mr-3" />
      Cerrar Sesión
    </Button>
  )
}
