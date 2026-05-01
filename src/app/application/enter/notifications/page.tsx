import { getAdminNotifications } from '@/features/admin/actions'
import { format } from 'date-fns'
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
import { MarkAllReadButton, MarkReadButton } from './NotificationActions'

export default async function AdminNotificationsPage() {
  const res = await getAdminNotifications(200)

  if (!res.success) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {res.error}
      </div>
    )
  }

  const rows = res.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signups, guest requests, profile changes, and credential uploads from clients and professionals.
          </p>
        </div>
        {rows.some((r) => !r.read_at) ? <MarkAllReadButton /> : null}
      </div>

      <Card className="border-teal-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
        <CardHeader className="pt-4">
          <CardTitle>Activity feed</CardTitle>
          <CardDescription>Newest first. Trigger-based events may show a null actor when the user was not signed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="text-right w-[120px]">Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No notifications yet.
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
                      <div className="font-medium text-sm">{n.title}</div>
                      {n.body ? (
                        <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line max-w-xl">{n.body}</div>
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
        </CardContent>
      </Card>
    </div>
  )
}
