import React from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 no-print">
      <div className="flex flex-col gap-1">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex text-xs font-semibold text-gray-400 gap-1.5 items-center">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={bc.label}>
                {idx > 0 && <span>/</span>}
                {bc.href ? (
                  <a href={bc.href} className="hover:text-gray-600 transition-colors">
                    {bc.label}
                  </a>
                ) : (
                  <span className="text-gray-500 font-bold">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
      </div>
      {/* Action buttons */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
