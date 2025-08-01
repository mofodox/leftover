import React from 'react';
import { cn } from '@/lib/utils';

// Input variant types
export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

// Input props interface
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Input variant styles
const inputVariants = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
};

// Input size styles
const inputSizes = {
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

// Input component
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperTextId = `${inputId}-helper`;

    // Determine variant based on error state
    const currentVariant = error ? 'error' : variant;

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-medium text-gray-700',
              labelSizes[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[
              error ? errorId : null,
              helperText ? helperTextId : null
            ].filter(Boolean).join(' ') || undefined}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              // Variant styles
              inputVariants[currentVariant],
              // Size styles
              inputSizes[size],
              // Icon padding adjustments
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              // Custom className
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
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

Input.displayName = 'Input';

// Textarea component with similar API
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      disabled,
      className,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const textareaId = id || React.useId();
    const errorId = `${textareaId}-error`;
    const helperTextId = `${textareaId}-helper`;

    // Determine variant based on error state
    const currentVariant = error ? 'error' : variant;

    // Resize styles
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'font-medium text-gray-700',
              labelSizes[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Textarea field */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[
            error ? errorId : null,
            helperText ? helperTextId : null
          ].filter(Boolean).join(' ') || undefined}
          className={cn(
            // Base styles
            'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            // Variant styles
            inputVariants[currentVariant],
            // Size styles
            inputSizes[size],
            // Resize styles
            resizeStyles[resize],
            // Custom className
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';