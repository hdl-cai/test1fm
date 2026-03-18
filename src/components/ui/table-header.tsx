"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/typography"

function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(TYPOGRAPHY.tableHeader, className)}
      {...props}
    >
      {children}
    </th>
  )
}

export { TableHeader }
