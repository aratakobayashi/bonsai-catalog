import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  'aria-label'?: string
  children?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    asChild, 
    isLoading, 
    loadingText = '読み込み中...',
    children,
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-semibold',
      'transition-all duration-300 ease-luxury',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
      'active:translate-y-[1px]'
    )
    
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
    
    const isDisabled = disabled || isLoading
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel || (isLoading ? loadingText : undefined)}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">{loadingText}</span>
            {loadingText}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }