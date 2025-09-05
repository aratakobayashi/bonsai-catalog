import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bonsai-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-bonsai-green-600 text-white hover:bg-bonsai-green-700',
      secondary: 'bg-earth-brown-600 text-white hover:bg-earth-brown-700',
      outline: 'border border-bonsai-green-600 text-bonsai-green-600 hover:bg-bonsai-green-50',
      ghost: 'text-bonsai-green-600 hover:bg-bonsai-green-50'
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg'
    }
    
    const combinedClassName = cn(baseClasses, variants[variant], sizes[size], className)
    
    if (asChild) {
      // asChildの場合は、childrenが含まれていることを想定してclassNameを返す
      return props.children as React.ReactElement
    }
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }