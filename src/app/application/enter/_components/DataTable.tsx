'use client'

import { useState, type ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminTheme } from './admin-theme'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  searchExtra?: ReactNode
  headerExtra?: ReactNode
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  renderRowActions?: (item: T) => ReactNode
  getRowKey?: (item: T) => string | number
  addLabel?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  count?: number
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSearch,
  searchExtra,
  headerExtra,
  onAdd,
  onEdit,
  onDelete,
  renderRowActions,
  getRowKey,
  addLabel = 'Add New',
  page = 1,
  totalPages = 1,
  onPageChange,
  count = 0,
}: DataTableProps<T>) {
  const showActionsCol = Boolean(renderRowActions || onEdit || onDelete)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="liquid-glass space-y-4 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2 sm:max-w-xl sm:flex-1 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className={cn('absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2', adminTheme.iconMuted)} />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn('pl-10', adminTheme.input)}
            />
          </div>
          {searchExtra}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {headerExtra}
          {onAdd && (
            <Button onClick={onAdd} className={adminTheme.ctaButton}>
              <Plus className="mr-2 h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {data.length === 0 ? (
          <div className={adminTheme.emptyState}>No data found</div>
        ) : (
          data.map((item) => {
            const rowKey = getRowKey ? String(getRowKey(item)) : String(item.id)
            const [primaryColumn, ...detailColumns] = columns
            const primaryContent = primaryColumn
              ? primaryColumn.render
                ? primaryColumn.render(item)
                : (item as any)[primaryColumn.key] || 'N/A'
              : null

            return (
              <div key={rowKey} className={adminTheme.mobileCard}>
                {primaryColumn ? (
                  <div className="mb-3 min-w-0 border-b border-lp-outline-variant/25 pb-3">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-lp-brand">
                      {primaryColumn.label}
                    </p>
                    <div className="min-w-0 text-sm font-semibold text-lp-on-surface [overflow-wrap:anywhere]">
                      {primaryContent}
                    </div>
                  </div>
                ) : null}

                {detailColumns.length > 0 ? (
                  <dl className="space-y-3">
                    {detailColumns.map((column) => {
                      const value = column.render
                        ? column.render(item)
                        : (item as any)[column.key] || 'N/A'

                      return (
                        <div key={column.key} className="min-w-0">
                          <dt className="text-[10px] font-black uppercase tracking-widest text-lp-on-surface-variant">
                            {column.label}
                          </dt>
                          <dd className="mt-1 min-w-0 text-sm text-lp-on-surface [overflow-wrap:anywhere] [&_*]:max-w-full">
                            {value}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                ) : null}

                {showActionsCol && (
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-lp-outline-variant/25 pt-3">
                    {renderRowActions ? (
                      <div className="flex flex-wrap items-center justify-end gap-2">{renderRowActions(item)}</div>
                    ) : (
                      <>
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className={cn('rounded-lg', adminTheme.hoverSurface)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(item)}
                            className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl sm:block">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className={adminTheme.tableHeader}>
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold text-lp-on-surface">
                  {column.label}
                </TableHead>
              ))}
              {showActionsCol && (
                <TableHead className="text-right font-semibold text-lp-on-surface">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActionsCol ? 1 : 0)}
                  className="py-12 text-center text-lp-on-surface-variant"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={getRowKey ? String(getRowKey(item)) : String(item.id)}
                  className={adminTheme.tableRowHover}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : (item as any)[column.key] || 'N/A'}
                    </TableCell>
                  ))}
                  {showActionsCol && (
                    <TableCell className="text-right">
                      {renderRowActions ? (
                        <div className="flex items-center justify-end gap-2">{renderRowActions(item)}</div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                              className={cn('rounded-lg', adminTheme.hoverSurface)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item)}
                              className="rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-lp-on-surface-variant">
            Showing {data.length} of {count} results
          </p>
          <Pagination>
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) onPageChange?.(page - 1)
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange?.(p)
                    }}
                    isActive={p === page}
                    className="rounded-lg"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) onPageChange?.(page + 1)
                  }}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
