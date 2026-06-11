import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';
import { cn } from '../lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variantConfig: Record<string, { icon: React.ReactNode; confirmVariant: 'danger' | 'primary' | 'secondary'; iconBg: string }> = {
  danger: {
    icon: <AlertCircle size={24} />,
    confirmVariant: 'danger',
    iconBg: 'bg-red-100 text-red-600',
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    confirmVariant: 'secondary',
    iconBg: 'bg-yellow-100 text-yellow-600',
  },
  info: {
    icon: <Info size={24} />,
    confirmVariant: 'primary',
    iconBg: 'bg-[#D0E4E6] text-[#0A5A64]',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}) => {
  const config = variantConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center py-4">
        <div className={cn('flex items-center justify-center w-14 h-14 rounded-full mb-4', config.iconBg)}>
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" onClick={onCancel} className="flex-1" size="md">
            {cancelText}
          </Button>
          <Button variant={config.confirmVariant} onClick={onConfirm} className="flex-1" size="md">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
