import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { adminTheme } from "./admin-theme"

interface AdminPageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function AdminPageHeader({ title, description, children, className }: AdminPageHeaderProps) {
  return (
    <header className={cn("liquid-glass rounded-2xl p-6 sm:p-8", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className={adminTheme.pageTitle}>{title}</h1>
          {description ? <p className={adminTheme.pageDescription}>{description}</p> : null}
        </div>
        {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </header>
  )
}
