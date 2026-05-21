import type { ReactNode } from "react"
import { adminTheme } from "./admin-theme"

interface AdminPageHeaderProps {
  title: string
  children?: ReactNode
}

export function AdminPageHeader({ title, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className={adminTheme.pageTitle}>{title}</h1>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}
