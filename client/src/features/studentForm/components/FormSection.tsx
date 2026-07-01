import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection = ({ title, icon, children, className = '' }: FormSectionProps) => (
  <section className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
      {icon && (
        <span className="material-symbols-outlined text-xl text-indigo-400">{icon}</span>
      )}
      <h2 className="font-semibold text-white">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);
