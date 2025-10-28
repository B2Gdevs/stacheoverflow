import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold text-sm transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 rounded-[30px] px-4 py-2 min-h-[40px] cursor-pointer select-none touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-white border-2 border-green text-green shadow-[#422800_4px_4px_0_0] hover:bg-white hover:shadow-[#422800_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#422800_2px_2px_0_0] active:translate-y-[2px]",
        destructive:
          "bg-black border-2 border-[#d63031] text-[#d63031] shadow-[#d63031_4px_4px_0_0] hover:bg-white hover:shadow-[#d63031_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#d63031_2px_2px_0_0] active:translate-y-[2px]",
        outline:
          "bg-black border-2 border-[#1971c2] text-[#1971c2] shadow-[#1971c2_4px_4px_0_0] hover:bg-white hover:shadow-[#1971c2_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#1971c2_2px_2px_0_0] active:translate-y-[2px]",
        secondary:
          "bg-black border-2 border-[#2f9e44] text-[#2f9e44] shadow-[#2f9e44_4px_4px_0_0] hover:bg-white hover:shadow-[#2f9e44_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#2f9e44_2px_2px_0_0] active:translate-y-[2px]",
        ghost:
          "bg-black border-2 border-[#fab005] text-[#fab005] shadow-[#fab005_4px_4px_0_0] hover:bg-white hover:shadow-[#fab005_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#fab005_2px_2px_0_0] active:translate-y-[2px]",
        link: "bg-black border-2 border-[#ae3ec9] text-[#ae3ec9] shadow-[#ae3ec9_4px_4px_0_0] hover:bg-white hover:shadow-[#ae3ec9_2px_2px_0_0] hover:translate-y-[2px] active:shadow-[#ae3ec9_2px_2px_0_0] active:translate-y-[2px]",
      },
      size: {
        default: "h-[40px] px-4 py-2 has-[>svg]:px-3 min-w-[100px] md:min-w-[120px] md:px-5",
        sm: "h-8 px-3 py-1 has-[>svg]:px-2 text-xs min-w-[80px] md:min-w-[100px] md:px-4",
        lg: "h-12 px-6 py-3 has-[>svg]:px-4 text-base min-w-[120px] md:min-w-[140px] md:px-7",
        icon: "size-[40px] min-w-[40px]",
        "icon-sm": "size-8 min-w-[32px]",
        "icon-lg": "size-12 min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
