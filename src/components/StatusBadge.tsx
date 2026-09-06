import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Lock, Award } from 'lucide-react';
import { DueItemStatus } from '../types';

interface StatusBadgeProps {
  status: DueItemStatus | 'CERTIFIED' | 'LOCKED';
  amount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  amount = 0,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const iconSize = iconSizes[size];

  switch (status) {
    case 'PENDING_REVIEW':
      return (
        <span
          id="badge-pending-review"
          className={`inline-flex items-center font-medium rounded-sm bg-[#F0EFEB] text-[#6B685F] border border-[#DDD9CE] ${sizeClasses[size]} ${className}`}
        >
          <Lock size={iconSize} className="text-[#878274] shrink-0" />
          <span className="whitespace-nowrap">Pending review</span>
        </span>
      );

    case 'DUE_FLAGGED':
      return (
        <span
          id="badge-due-flagged"
          className={`inline-flex items-center font-semibold rounded-sm bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5] ${sizeClasses[size]} ${className}`}
        >
          <AlertTriangle size={iconSize} className="text-[#DC2626] shrink-0" />
          <span className="whitespace-nowrap">
            Due Flagged: <span className="font-mono font-bold">₹{amount.toLocaleString('en-IN')}</span>
          </span>
        </span>
      );

    case 'PAYMENT_SUBMITTED':
      return (
        <span
          id="badge-payment-submitted"
          className={`inline-flex items-center font-medium rounded-sm bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE] ${sizeClasses[size]} ${className}`}
        >
          <Clock size={iconSize} className="text-[#4F46E5] shrink-0" />
          <span className="whitespace-nowrap">Verification Pending</span>
        </span>
      );

    case 'CLEARED':
      return (
        <span
          id="badge-cleared"
          className={`inline-flex items-center font-semibold rounded-sm bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] ${sizeClasses[size]} ${className}`}
        >
          <CheckCircle2 size={iconSize} className="text-[#059669] shrink-0" />
          <span className="whitespace-nowrap">Cleared / ₹0</span>
        </span>
      );

    case 'CERTIFIED':
      return (
        <span
          id="badge-certified"
          className={`inline-flex items-center font-semibold rounded-sm bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] ${sizeClasses[size]} ${className}`}
        >
          <Award size={iconSize} className="text-[#D97706] shrink-0" />
          <span className="whitespace-nowrap">Digitally Certified</span>
        </span>
      );

    case 'LOCKED':
      return (
        <span
          id="badge-locked"
          className={`inline-flex items-center font-medium rounded-sm bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] ${sizeClasses[size]} ${className}`}
        >
          <Lock size={iconSize} className="text-[#6B7280] shrink-0" />
          <span className="whitespace-nowrap">Locked</span>
        </span>
      );

    default:
      return null;
  }
};
