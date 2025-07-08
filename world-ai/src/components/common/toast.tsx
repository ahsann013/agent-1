import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastProps = {
  message: string;
  variant: 'success' | 'error' | 'info';
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, variant, onClose }) => {
  // Define variant-specific styles and icons
  const variantConfig = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-500',
      textColor: 'text-green-800 dark:text-green-200',
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      borderColor: 'border-red-500',
      textColor: 'text-red-800 dark:text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  // Auto-dismiss effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed bottom-4 right-4 
        animate-in slide-in-from-right-full fade-in
        duration-300 ease-out
        max-w-sm w-full 
        ${variantConfig[variant].bgColor}
        border-l-4 ${variantConfig[variant].borderColor}
        p-4 rounded-lg shadow-lg
        flex items-start space-x-3 z-100
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        {variantConfig[variant].icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${variantConfig[variant].textColor}`}>
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className={`
          flex-shrink-0 
          ${variantConfig[variant].textColor}
          hover:opacity-70 
          transition-opacity 
          focus:outline-none 
          focus:ring-2 
          focus:ring-offset-2 
          focus:ring-${variant === 'info' ? 'blue' : variant === 'success' ? 'green' : 'red'}-500
        `}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
