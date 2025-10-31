'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Calendar, AlertTriangle, ChevronRight, Shield, Wrench } from 'lucide-react'
import type { Vehiculo } from '@/lib/types'
import { format, differenceInDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface VehiculoCardProps {
  vehiculo: Vehiculo
}

export function VehiculoCard({ vehiculo }: VehiculoCardProps) {
  // Calcular alertas de vencimiento
  const alertas = []

  if (vehiculo.soat_vencimiento) {
    const diasSOAT = differenceInDays(parseISO(vehiculo.soat_vencimiento), new Date())
    if (diasSOAT < 0) {
      alertas.push({ tipo: 'SOAT VENCIDO', dias: Math.abs(diasSOAT), vencido: true, icon: Shield })
    } else if (diasSOAT <= 30) {
      alertas.push({ tipo: 'SOAT POR VENCER', dias: diasSOAT, vencido: false, icon: Shield })
    }
  }

  if (vehiculo.tecnomecanica_vencimiento) {
    const diasTecno = differenceInDays(parseISO(vehiculo.tecnomecanica_vencimiento), new Date())
    if (diasTecno < 0) {
      alertas.push({ tipo: 'TECNOMECÁNICA VENCIDA', dias: Math.abs(diasTecno), vencido: true, icon: Wrench })
    } else if (diasTecno <= 30) {
      alertas.push({ tipo: 'TECNOMECÁNICA POR VENCER', dias: diasTecno, vencido: false, icon: Wrench })
    }
  }

  const getEstadoBadge = () => {
    const estado = vehiculo.estado_operativo.toUpperCase()
    switch (vehiculo.estado_operativo) {
      case 'operativo':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1">
            {estado}
          </Badge>
        )
      case 'mantenimiento':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1">
            {estado}
          </Badge>
        )
      case 'reparacion':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1">
            {estado}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="font-bold px-3 py-1">
            {estado}
          </Badge>
        )
    }
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wider">
                {vehiculo.placa}
              </h3>
              <p className="text-sm text-blue-100 font-medium uppercase mt-1">
                {vehiculo.marca} {vehiculo.modelo}
              </p>
            </div>
          </div>
          {getEstadoBadge()}
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Tipo de vehículo */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">
            {vehiculo.tipo}
          </span>
        </div>

        {/* Documentación */}
        {(vehiculo.soat_vencimiento || vehiculo.tecnomecanica_vencimiento) && (
          <div className="space-y-2 pt-2 border-t-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                DOCUMENTACIÓN
              </span>
            </div>
            {vehiculo.soat_vencimiento && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  SOAT:
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                  {format(parseISO(vehiculo.soat_vencimiento), 'dd MMM yyyy', { locale: es }).toUpperCase()}
                </span>
              </div>
            )}
            {vehiculo.tecnomecanica_vencimiento && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  TECNOMECÁNICA:
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                  {format(parseISO(vehiculo.tecnomecanica_vencimiento), 'dd MMM yyyy', { locale: es }).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="space-y-2 pt-2 border-t-2 border-red-100 dark:border-red-900">
            {alertas.map((alerta, index) => {
              const Icon = alerta.icon
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    alerta.vencido
                      ? 'bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      alerta.vencido ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-xs font-bold uppercase ${
                        alerta.vencido ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {alerta.tipo}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        alerta.vencido ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {alerta.vencido ? `HACE ${alerta.dias} DÍAS` : `EN ${alerta.dias} DÍAS`}
                    </p>
                  </div>
                  <Icon className={`h-4 w-4 ${
                    alerta.vencido ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                </div>
              )
            })}
          </div>
        )}

        {/* Estado Inactivo */}
        {!vehiculo.activo && (
          <Badge variant="outline" className="w-full justify-center py-2 border-2 font-bold uppercase">
            INACTIVO
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 sm:p-5 pt-0">
        <Link href={`/dashboard/vehiculos/${vehiculo.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all font-semibold uppercase"
          >
            VER DETALLES
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
