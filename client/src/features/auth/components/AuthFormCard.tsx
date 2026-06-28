import type { ReactNode } from 'react';
import { authFormCardClass } from './authFormStyles';

interface AuthFormCardProps {
  children: ReactNode;
  className?: string;
}

export const AuthFormCard = ({ children, className = '' }: AuthFormCardProps) => (
  <div
    className={`${authFormCardClass} animate-in fade-in slide-in-from-bottom-3 duration-400 ${className}`}
  >
    {children}
  </div>
);
