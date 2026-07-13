import React from 'react';

interface BadgeProps {
  content: string;
  variant?: 'success' | 'warning' | 'danger' | 'pending' | 'draft' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  content,
  variant = 'draft',
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const variants = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)]',
    pending: 'bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border-[var(--color-pending-border)]',
    draft: 'bg-[var(--color-draft-bg)] text-[var(--color-draft-text)] border-[var(--color-draft-border)]',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {content}
    </span>
  );
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'approved':
      return <Badge content="အောင်မြင်သည်" variant="success" />;
    case 'REJECTED':
    case 'rejected':
      return <Badge content="ငြင်းပယ်သည်" variant="danger" />;
    case 'PAYMENT_SUBMITTED':
      return <Badge content="ငွေပေးသွင်းပြီး" variant="info" />;
    case 'PROFILE_COMPLETED':
      return <Badge content="ကိုယ်ရေးအချက်အလက်ပြည့်စုံ" variant="pending" />;
    case 'NRC_UPLOADED':
      return <Badge content="NRC တင်ပြီး" variant="pending" />;
    case 'DOCUMENTS_UPLOADED':
      return <Badge content="စာရွက်စာတမ်းတင်ပြီး" variant="pending" />;
    case 'pending':
      return <Badge content="စိစစ်ဆဲ" variant="warning" />;
    case 'unclaimed':
      return <Badge content="အကောင့်မဖွင့်ရသေး" variant="draft" />;
    case 'claimed':
      return <Badge content="အကောင့်ဖွင့်ပြီး" variant="success" />;
    default:
      return <Badge content={status} variant="draft" />;
  }
};

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'owner':
      return <Badge content="Owner" variant="danger" />;
    case 'super':
      return <Badge content="Super Admin" variant="warning" />;
    case 'admin':
      return <Badge content="Admin" variant="info" />;
    case 'finance':
      return <Badge content="Finance" variant="success" />;
    case 'student':
      return <Badge content="Student" variant="draft" />;
    default:
      return <Badge content={role} variant="draft" />;
  }
};
