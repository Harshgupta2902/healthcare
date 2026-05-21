import { getAdminNotifications } from '@/features/admin/actions'
import { format } from 'date-fns'
import { resolveNotificationQueryDates } from './notification-date-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminPageHeader } from '../_components/AdminPageHeader'
import { adminTheme } from '../_components/admin-theme'
import { MarkAllReadButton, MarkReadButton } from './NotificationActions'
import { NotificationDateFilter } from './NotificationDateFilter'
import type { Metadata } from 'next'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Notifications',
  description:
    'Notifications: admin inbox for platform notifications, operational alerts, and read/unread status on HealthHere.',
  pathname: '/application/enter/notifications',
  robots: ROBOTS_NOINDEX,
})

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const urlFrom = typeof params.from === 'string' ? params.from : undefined
  const urlTo = typeof params.to === 'string' ? params.to : undefined
  const { from, to } = resolveNotificationQueryDates(urlFrom, urlTo)

  const res = await getAdminNotifications(200, { from, to })

  if (!res.success) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Notifications">
          <NotificationDateFilter urlFrom={urlFrom} urlTo={urlTo} />
        </AdminPageHeader>
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {res.error}
        </div>
      </div>
    )
  }

  const rows = res.data
  const emptyMessage = 'No notifications in this date range.'

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Notifications">
        <NotificationDateFilter urlFrom={urlFrom} urlTo={urlTo} />
        {rows.some((r) => !r.read_at) ? <MarkAllReadButton /> : null}
      </AdminPageHeader>

      <Card className="liquid-glass overflow-hidden rounded-2xl border-0 shadow-none">
        <CardHeader className="px-4 pt-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Activity feed</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Newest first. Trigger-based events may show a null actor when the user was not signed in.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:hidden">
            {rows.length === 0 ? (
              <div className="liquid-glass rounded-xl p-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              rows.map((n) => (
                <div
                  key={n.id}
                  className={`${adminTheme.mobileCard} ${n.read_at ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-lp-on-surface">{n.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(n.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    {n.read_at ? (
                      <span className="shrink-0 text-xs text-muted-foreground">Read</span>
                    ) : (
                      <MarkReadButton id={n.id} />
                    )}
                  </div>

                  {n.actor ? (
                    <div className="mt-3 min-w-0 text-xs text-muted-foreground">
                      <span className="font-medium text-lp-on-surface">{n.actor.name}</span>
                      <span className="break-all"> · {n.actor.email}</span>
                      <Badge variant="secondary" className="ml-2 capitalize text-[10px]">
                        {n.actor.role}
                      </Badge>
                    </div>
                  ) : null}

                  {n.body ? (
                    <p className="mt-3 whitespace-pre-line break-words text-xs leading-relaxed text-muted-foreground">
                      {n.body}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-[120px] text-right">Read</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((n) => (
                    <TableRow key={n.id} className={n.read_at ? 'opacity-70' : undefined}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(n.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {n.actor ? (
                          <span>
                            <span className="font-medium">{n.actor.name}</span>
                            <span className="text-muted-foreground"> · {n.actor.email}</span>
                            <Badge variant="secondary" className="ml-2 capitalize text-[10px]">
                              {n.actor.role}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{n.title}</div>
                        {n.body ? (
                          <div className="mt-0.5 max-w-xl text-xs whitespace-pre-line text-muted-foreground">
                            {n.body}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        {n.read_at ? (
                          <span className="text-xs text-muted-foreground">Read</span>
                        ) : (
                          <MarkReadButton id={n.id} />
                        )}
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
