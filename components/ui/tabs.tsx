'use client'
import * as React from 'react'
import * as Primitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
export const Tabs = Primitive.Root
export const TabsList = React.forwardRef<
  React.ElementRef<typeof Primitive.List>,
  React.ComponentPropsWithoutRef<typeof Primitive.List>
>(({ className, ...props }, ref) => (
  <Primitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full bg-[#f4f6f7] p-1',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.Trigger>
>(({ className, ...props }, ref) => (
  <Primitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-xs text-[#647476] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087d87] data-[state=active]:bg-white data-[state=active]:text-[#213b3d] data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, ...props }, ref) => (
  <Primitive.Content
    ref={ref}
    className={cn(
      'outline-none focus-visible:ring-2 focus-visible:ring-[#087d87]',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'
