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
  /** Rendered immediately after the search input (e.g. status filter). */
  searchExtra?: ReactNode
  /** Renders next to the Add button (e.g. secondary actions). */
  headerExtra?: ReactNode
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  /** When set, renders the Actions column instead of default edit/delete buttons */
  renderRowActions?: (item: T) => ReactNode
  /** Stable row key (defaults to `String(item.id)`). Use when `id` is not unique or absent. */
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center sm:max-w-xl">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 border-teal-200 dark:border-gray-700 rounded-xl"
            />
          </div>
          {searchExtra}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {headerExtra}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-200/70 bg-white/80 p-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
            No data found
          </div>
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
              <div
                key={rowKey}
                className="rounded-2xl border border-teal-200/60 bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-gray-700/70 dark:bg-gray-900/85"
              >
                {primaryColumn ? (
                  <div className="mb-3 min-w-0 border-b border-teal-100 pb-3 dark:border-gray-800">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-300">
                      {primaryColumn.label}
                    </p>
                    <div className="min-w-0 text-sm font-semibold text-gray-900 [overflow-wrap:anywhere] dark:text-white">
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
                          <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {column.label}
                          </dt>
                          <dd className="mt-1 min-w-0 text-sm text-gray-700 [overflow-wrap:anywhere] dark:text-gray-200 [&_*]:max-w-full">
                            {value}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                ) : null}

                {showActionsCol && (
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-teal-100 pt-3 dark:border-gray-800">
                    {renderRowActions ? (
                      <div className="flex flex-wrap items-center justify-end gap-2">{renderRowActions(item)}</div>
                    ) : (
                      <>
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="rounded-lg hover:bg-teal-100 dark:hover:bg-gray-800"
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

      <div className="hidden rounded-2xl border border-teal-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg overflow-x-auto sm:block">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-teal-50/50 dark:bg-gray-800/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.label}
                </TableHead>
              ))}
              {showActionsCol && (
                <TableHead className="text-right font-semibold">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActionsCol ? 1 : 0)}
                  className="text-center text-gray-500 py-12"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={getRowKey ? String(getRowKey(item)) : String(item.id)}
                  className="hover:bg-teal-50/30 dark:hover:bg-gray-800/30"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key] || 'N/A'}
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
                              className="rounded-lg hover:bg-teal-100 dark:hover:bg-gray-800"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item)}
                              className="rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
