"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/lib/typography"

interface StatValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
}

function StatValue({ 
  size = 'md', 
  className, 
  children, 
  ...props 
}: StatValueProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }
  
  return (
    <span
      className={cn(
        TYPOGRAPHY.statValue,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { StatValue }
export type { StatValueProps }
