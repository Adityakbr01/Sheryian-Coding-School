import React from 'react'
import { cn } from '@/utils/cn'

interface SlideButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  fullWidth?: boolean
  children: React.ReactNode
}

/**
 * Reusable Premium Button with "Sliding Text" animation.
 */
export const SlideButton = React.forwardRef<HTMLButtonElement, SlideButton>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      loadingText,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Styles mapping
    const variants = {
      primary: 'bg-(--accent) text-(--text-on-accent) hover:bg-(--accent-hover)',
      secondary: 'bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:bg-(--bg-elevated)',
      ghost: 'bg-transparent text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-primary)',
      danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white',
    }

    const sizes = {
      sm: 'px-4 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base font-semibold',
    }

    // Determine what text to show in BOTH sliding layers
    const label = isLoading && loadingText ? loadingText : children

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'group relative z-[1] overflow-hidden rounded-full transition-all duration-300 disabled:border-(--btn-disabled-border) disabled:bg-(--btn-disabled-bg) disabled:text-(--btn-disabled-text)',
          fullWidth ? 'w-full' : 'w-fit',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <span className="relative inline-block overflow-hidden align-middle">
          {/* Layer 1: Normal View / Slides OUT on hover */}
          <span
            className={cn(
              'block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
              !isLoading && 'group-hover:-translate-y-full'
            )}
          >
            {label}
          </span>

          {/* Layer 2: Transition View / Slides IN on hover */}
          {!isLoading && (
            <span
              className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0"
              aria-hidden="true"
            >
              {label}
            </span>
          )}
        </span>
      </button>
    )
  },
)

SlideButton.displayName = 'SlideButton'
