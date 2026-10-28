'use client'
import * as React from 'react'
import * as Primitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
export const Dialog = Primitive.Root
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close
export const DialogTitle = Primitive.Title
export const DialogDescription = Primitive.Description
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="fixed inset-0 z-50 bg-[#121627]/40 backdrop-blur-[2px]" />
    <Primitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#e1e3e8] bg-white p-7 text-[#21273d] shadow-xl outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Close
        className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666a78] hover:bg-[#f0f1f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0037FF]"
        aria-label="Close dialog"
      >
        <X size={17} />
      </Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>
))
DialogContent.displayName = 'DialogContent'
