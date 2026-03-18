"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/typography"

function PageTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(TYPOGRAPHY.pageTitle, className)}
      {...props}
    >
      {children}
    </h1>
  )
}

export { PageTitle }
