"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TYPOGRAPHY, type TypographyVariant } from "@/lib/typography"

type ElementType = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyVariant
  as?: ElementType
}

function Typography({
  variant,
  as: Component = "span",
  className,
  children,
  ...props
}: TypographyProps) {
  const typographyClass = TYPOGRAPHY[variant]
  
  return React.createElement(
    Component,
    {
      className: cn(typographyClass, className),
      ...props
    },
    children
  )
}

export { Typography }
export type { TypographyProps }
