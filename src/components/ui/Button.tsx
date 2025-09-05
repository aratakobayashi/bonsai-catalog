import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ease-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: cn(
        'bg-gradient-primary text-white shadow-luxury hover:shadow-hover hover:scale-105 active:scale-95',
        'group relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-shimmer-gradient before:opacity-0',
        'hover:before:animate-shimmer hover:before:opacity-30',
        'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      ),
      secondary: cn(
        'bg-gradient-accent text-white shadow-luxury hover:shadow-hover hover:scale-105 active:scale-95',
        'group relative overflow-hidden',
        'focus:ring-2 focus:ring-accent-500 focus:ring-offset-2'
      ),
      outline: cn(
        'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:shadow-lg',
        'hover:scale-105 active:scale-95 transition-all duration-200',
        'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'group relative overflow-hidden'
      ),
      ghost: cn(
        'text-primary-600 hover:bg-primary-50 hover:shadow-md',
        'hover:scale-105 active:scale-95 transition-all duration-200',
        'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'group relative overflow-hidden'
      ),
      luxury: cn(
        'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-premium',
        'hover:shadow-hover hover:scale-105 active:scale-95',
        'hover:from-accent-600 hover:to-accent-700',
        'group relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-shimmer-gradient before:opacity-0',
        'hover:before:animate-shimmer hover:before:opacity-100',
        'focus:ring-2 focus:ring-accent-500 focus:ring-offset-2',
        'animate-pulse-glow'
      )
    }
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-13 px-8 text-lg',
      xl: 'h-16 px-12 text-xl'
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