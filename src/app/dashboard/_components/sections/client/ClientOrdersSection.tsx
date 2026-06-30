"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHistoryList } from "@/features/booking-orders/components/OrderHistoryList";
import type { ClientOrderHistoryItem } from "@/features/booking-orders/types";
import { dashboardGlassCard } from "../../dashboard-theme";

type ClientOrdersSectionProps = {
  orders: ClientOrderHistoryItem[];
  isLoading: boolean;
  mounted?: boolean;
};

export function ClientOrdersSection({ orders, isLoading, mounted = true }: ClientOrdersSectionProps) {
  return (
    <Card className={dashboardGlassCard}>
      <CardHeader className="pt-4">
        <CardTitle className="font-heading text-xl font-bold">Order History</CardTitle>
        <CardDescription>Successful and failed consultation orders</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden p-4 sm:p-6 md:p-8">
        <OrderHistoryList orders={orders} isLoading={isLoading} mounted={mounted} />
      </CardContent>
    </Card>
  );
}
