'use client'

import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderHistoryList } from '@/features/booking-orders/components/OrderHistoryList'
import type { ClientOrderHistoryItem } from '@/features/booking-orders/types'

type ClientOrdersSectionProps = {
  orders: ClientOrderHistoryItem[]
  isLoading: boolean
}

export function ClientOrdersSection({ orders, isLoading }: ClientOrdersSectionProps) {
  return (
    <Card className="border border-lp-outline-variant/20 shadow-xl bg-lp-surface-container-lowest/80 backdrop-blur-md rounded-xl sm:rounded-3xl">
      <CardHeader className="pt-4 bg-emerald-50/30">
        <CardTitle className="text-xl font-black flex items-center gap-2 text-emerald-900">
          Order History
        </CardTitle>
        <CardDescription>Successful and failed consultation orders</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <OrderHistoryList orders={orders} />
        )}
      </CardContent>
    </Card>
  )
}
