import React, { useState } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  requireRemarks?: boolean;
  remarksPlaceholder?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'အတည်ပြုသည်',
  cancelText = 'မလုပ်တော့ပါ',
  variant = 'primary',
  requireRemarks = false,
  remarksPlaceholder = 'ငြင်းပယ်ရသည့် အကြောင်းအရင်းကို ရေးပါ...',
  isLoading = false,
}) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(remarks);
    setRemarks('');
  };

  const btnVariants = {
    primary: 'primary' as const,
    danger: 'danger' as const,
    warning: 'primary' as const, // mapping warnings to primary/danger as suited
    success: 'success' as const,
  };

  const headerColors = {
    primary: 'text-blue-600',
    danger: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-green-600',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40">
      <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-100 transition-all">
        {/* Title */}
        <h3 className={`text-lg font-semibold mb-2 ${headerColors[variant]}`}>
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-sm text-gray-600 mb-4 whitespace-pre-line leading-relaxed">
          {message}
        </p>

        {/* Optional Remarks Textarea */}
        {requireRemarks && (
          <div className="mb-4">
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={remarksPlaceholder}
              className="block w-full text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRemarks('');
              onClose();
            }}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={btnVariants[variant]}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={requireRemarks && !remarks.trim()}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
