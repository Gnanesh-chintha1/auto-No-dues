import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { SignStamp } from '../types';

interface SignatureBlockProps {
  stamp: SignStamp;
  compact?: boolean;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({ stamp, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(stamp.signatureHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(stamp.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (compact) {
    return (
      <div
        id={`sig-block-${stamp.stampId}`}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F4F9F6] border border-[#A7F3D0] text-xs text-[#065F46]"
      >
        <ShieldCheck size={14} className="text-[#059669] shrink-0" />
        <span className="font-medium truncate">
          Signed by {stamp.officerName}
        </span>
        <span className="text-[#047857] font-mono-code text-[10px]">
          ({stamp.signatureHash.slice(0, 8)}...)
        </span>
      </div>
    );
  }

  return (
    <div
      id={`sig-block-card-${stamp.stampId}`}
      className="p-3.5 rounded-lg bg-[#F8FAF8] border border-[#C5E1D4] text-xs text-[#1F2937] space-y-1.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#065F46]">
          <ShieldCheck size={16} className="text-[#059669] shrink-0" />
          <span>Digitally Signed & Validated</span>
        </div>
        <span className="font-mono-code text-[11px] px-1.5 py-0.5 rounded bg-[#E6F4ED] text-[#065F46] font-medium">
          {stamp.stampId}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[#374151]">
        <div>
          <span className="text-[#6B7280]">Officer:</span>{' '}
          <span className="font-semibold">{stamp.officerName}</span>
        </div>
        <div>
          <span className="text-[#6B7280]">Designation:</span>{' '}
          <span>{stamp.officerDesignation}</span>
        </div>
        <div>
          <span className="text-[#6B7280]">Timestamp:</span>{' '}
          <span className="font-mono-code">{formattedDate}</span>
        </div>
        <div>
          <span className="text-[#6B7280]">Officer ID:</span>{' '}
          <span className="font-mono-code">{stamp.officerId}</span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-[#DDECE4] flex items-center justify-between text-[11px] font-mono-code text-[#4B5563]">
        <div className="truncate mr-2">
          <span className="text-[#6B7280]">SHA-256: </span>
          <span className="text-[#047857] font-semibold">{stamp.signatureHash.slice(0, 20)}...{stamp.signatureHash.slice(-8)}</span>
        </div>
        <button
          id={`copy-hash-${stamp.stampId}`}
          type="button"
          onClick={copyHash}
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-white hover:bg-[#EBF5EF] border border-[#BDE0CE] text-[#065F46] transition-colors shrink-0"
          title="Copy full cryptographic sign stamp hash"
        >
          {copied ? (
            <>
              <CheckCircle size={11} className="text-[#059669]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy Hash</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
