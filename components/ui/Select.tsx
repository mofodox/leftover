import React from 'react';
import { cn } from '@/lib/utils';

// Select option interface
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Select variant types
export type SelectVariant = 'default' | 'error' | 'success';
export type SelectSize = 'sm' | 'md' | 'lg';

// Select props interface
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: SelectVariant;
  size?: SelectSize;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

// Select variant styles
const selectVariants = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
};

// Select size styles
const selectSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

// Label size styles
const labelSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

// Helper text size styles
const helperTextSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

// Chevron down icon
const ChevronDownIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// Select component
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      error,
      helperText,
      placeholder,
      options,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const selectId = id || React.useId();
    const errorId = `${selectId}-error`;
    const helperTextId = `${selectId}-helper`;

    // Determine variant based on error state
    const currentVariant = error ? 'error' : variant;

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'font-medium text-gray-700',
              labelSizes[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Select container */}
        <div className="relative">
          {/* Select field */}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[
              error ? errorId : null,
              helperText ? helperTextId : null
            ].filter(Boolean).join(' ') || undefined}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none bg-white pr-10',
              // Variant styles
              selectVariants[currentVariant],
              // Size styles
              selectSizes[size],
              // Custom className
              className
            )}
            {...props}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Options */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className={cn(
              'text-red-600 font-medium',
              helperTextSizes[size]
            )}
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={helperTextId}
            className={cn(
              'text-gray-500',
              helperTextSizes[size]
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';