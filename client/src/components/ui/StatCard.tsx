import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-white border border-gray-150 rounded-xl shadow-sm flex items-start justify-between ${className}`}>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        {description && <span className="text-xs text-gray-400 font-medium">{description}</span>}
      </div>
      {icon && (
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          {icon}
        </div>
      )}
    </div>
  );
};
