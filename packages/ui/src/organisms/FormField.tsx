import React from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
  className?: string;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  helpText,
  className,
  id,
}) => {
  const fieldId = id || (label ? `field-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-gray-700 rtl:text-right"
        >
          {label}
          {required && <span className="text-red-500 mr-1 rtl:ml-1">*</span>}
        </label>
      )}
      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              ...(fieldId ? { id: fieldId } : {}),
              'aria-invalid': !!error,
              'aria-describedby': error
                ? `${fieldId}-error`
                : helpText
                  ? `${fieldId}-help`
                  : undefined,
            })
          : children}
      </div>
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="text-sm text-gray-400 rtl:text-right">
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-sm text-red-500 rtl:text-right"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
