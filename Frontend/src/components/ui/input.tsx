import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
         "flex h-10 w-full rounded-md border border-white/30 bg-gray-100/30 backdrop-blur-md px-3 py-2 text-black placeholder:text-gray-500 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
          )}


        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
