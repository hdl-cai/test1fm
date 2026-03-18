"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/typography"

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(TYPOGRAPHY.label, className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Label }
