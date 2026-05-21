import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { adminTheme } from "./admin-theme"

interface AdminPageHeaderProps {
  title: string
  children?: ReactNode
}

export function AdminPageHeader({ title, children }: AdminPageHeaderProps) {
  return (
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <h1 className={cn(adminTheme.pageTitle, "min-w-0 shrink-0")}>{title}</h1>
        {children ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 md:ml-auto md:justify-end">
            {children}
          </div>
        ) : null}
      </div>
  )
}
