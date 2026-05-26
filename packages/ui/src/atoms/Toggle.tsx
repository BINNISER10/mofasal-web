import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { ConfirmDialog } from '../molecules/ConfirmDialog';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showConfirmDialog?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  className?: string;
}

const sizeStyles = {
  sm: { track: 'w-8 h-5', circle: 'w-3.5 h-3.5', translateOn: 'translate-x-3', translateOff: 'translate-x-0.5' },
  md: { track: 'w-11 h-6', circle: 'w-5 h-5', translateOn: 'translate-x-5', translateOff: 'translate-x-0.5' },
  lg: { track: 'w-14 h-7', circle: 'w-6 h-6', translateOn: 'translate-x-7', translateOff: 'translate-x-0.5' },
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  labelPosition = 'right',
  description,
  disabled = false,
  size = 'md',
  showConfirmDialog = false,
  confirmTitle = 'Confirm Change',
  confirmDescription = 'Are you sure you want to change this setting?',
  className,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const s = sizeStyles[size];

  const handleToggle = () => {
    if (disabled) return;
    if (showConfirmDialog) {
      setShowConfirm(true);
    } else {
      onChange(!checked);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onChange(!checked);
  };

  const content = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#D0E4E6] focus:ring-offset-2',
        checked ? 'bg-[#00373E]' : 'bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
        s.track
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out',
          s.circle,
          checked ? s.translateOn : s.translateOff
        )}
      />
    </button>
  );

  return (
    <>
      <div className={cn('flex items-center gap-3', className)}>
        {label && labelPosition === 'left' && (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
        {content}
        {label && labelPosition === 'right' && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirm}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          title={confirmTitle}
          message={confirmDescription}
          variant="info"
        />
      )}
    </>
  );
};
