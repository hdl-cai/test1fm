import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted/30 text-muted-foreground inline-flex h-fit w-fit items-center justify-center rounded-2xl p-1.5",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors transition-transform transition-opacity transition-shadow transition-[width] outline-none focus-visible:ring-[2px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 data-[state=active]:border data-[state=active]:border-primary/20 data-[state=active]:scale-[1.02] hover:text-foreground hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

// Line Tabs Variant - Underline style tabs
function LineTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="line-tabs-list"
      className={cn(
        "text-muted-foreground inline-flex h-fit w-fit items-center justify-center border-b border-border bg-transparent p-0",
        className
      )}
      {...props}
    />
  )
}

function LineTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="line-tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-center gap-2 border-b-2 border-transparent px-6 py-3 text-micro font-black uppercase tracking-widest whitespace-nowrap transition-colors transition-opacity outline-none focus-visible:ring-[2px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-primary hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, LineTabsList, LineTabsTrigger }
