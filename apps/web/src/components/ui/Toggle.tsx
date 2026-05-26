'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showConfirmation?: boolean;
  confirmationMessage?: string;
  id?: string;
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  showConfirmation = false,
  confirmationMessage,
  id,
}: ToggleProps) {
  const [showModal, setShowModal] = React.useState(false);

  const handleChange = () => {
    if (!checked && showConfirmation) {
      setShowModal(true);
    } else {
      onChange(!checked);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    onChange(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-3">
        {label && (
          <div className="flex-1 ml-4">
            <label
              htmlFor={id}
              className="text-sm font-semibold text-gray-800 cursor-pointer"
            >
              {label}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleChange}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            checked ? 'bg-primary-600' : 'bg-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-jahez-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد التعطيل</h3>
            <p className="text-gray-600 mb-4">
              {confirmationMessage ||
                'سيؤدي تعطيل هذه الميزة إلى إيقاف الخدمات المرتبطة بها. هل أنت متأكد؟'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
              >
                تأكيد التعطيل
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
