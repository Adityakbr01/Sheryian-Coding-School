import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  align?: 'left' | 'right'
}

export function CustomSelect({
  options,
  value,
  onChange,
  className = '',
  align = 'left',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) py-2 pl-3 pr-2 text-sm font-medium text-(--text-primary) shadow-sm transition-all hover:border-(--border-default) hover:bg-(--bg-overlay) focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/50 focus:outline-none"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-(--text-muted) transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-1 max-h-60 w-48 overflow-auto rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-1 shadow-lg ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                  value === option.value
                    ? 'bg-(--accent)/10 font-semibold text-(--accent)'
                    : 'text-(--text-primary) hover:bg-(--bg-elevated)'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 shrink-0 text-(--accent)" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
