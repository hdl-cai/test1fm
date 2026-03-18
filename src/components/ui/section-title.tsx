"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/typography"

function SectionTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(TYPOGRAPHY.sectionTitle, className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export { SectionTitle }
