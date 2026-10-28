'use client'
import * as React from 'react'
import * as Primitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
export const TooltipProvider = Primitive.Provider
export const Tooltip = Primitive.Root
export const TooltipTrigger = Primitive.Trigger
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-64 rounded-xl bg-[#0037FF] px-4 py-3 text-xs leading-relaxed text-white shadow-lg',
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
))
TooltipContent.displayName = 'TooltipContent'
