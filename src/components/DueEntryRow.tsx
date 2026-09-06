import React, { useState } from 'react';
import { DueRecord, StaffAccount } from '../types';
import { StatusBadge } from './StatusBadge';
import { SignatureBlock } from './SignatureBlock';
import { ChevronDown, ChevronUp, CreditCard, Shield, Send, CheckCircle2, XCircle, Info, Lock } from 'lucide-react';

interface DueEntryRowProps {
  due: DueRecord;
  isStaffView?: boolean;
  activeStaff?: StaffAccount | null;
  onRecordStaffDue?: (sectionCode: string, amount: number, remarks: string) => Promise<void>;
  onSubmitPayment?: (sectionCode: string, utr: string) => Promise<void>;
  onVerifyPayment?: (sectionCode: string, verified: boolean, remarks: string) => Promise<void>;
}

export const DueEntryRow: React.FC<DueEntryRowProps> = ({
  due,
  isStaffView = false,
  activeStaff = null,
  onRecordStaffDue,
  onSubmitPayment,
  onVerifyPayment,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Student Payment submission form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Staff action form state
  const [staffAmount, setStaffAmount] = useState<number | ''>('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffActionError, setStaffActionError] = useState('');

  const handleStudentSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      setPaymentError('Please enter a valid Bank UTR or Transaction Reference (min 6 chars).');
      return;
    }

    try {
      setSubmittingPayment(true);
      await onSubmitPayment?.(due.sectionCode, utrInput.trim());
      setShowPaymentForm(false);
      setUtrInput('');
    } catch (err: any) {
      setPaymentError(err.message || 'Payment submission failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleStaffRecordDue = async (amountToSet: number) => {
    setStaffActionError('');
    try {
      setStaffSubmitting(true);
      await onRecordStaffDue?.(
        due.sectionCode,
        amountToSet,
        staffRemarks || (amountToSet === 0 ? 'Confirmed No Dues / ₹0 by authority' : `Dues recorded: ₹${amountToSet}`)
      );
      setStaffRemarks('');
      setStaffAmount('');
    } catch (err: any) {
      setStaffActionError(err.message || 'Action failed.');
    } finally {
      setStaffSubmitting(false);
    }
  };

  const handleStaffVerify = async (verified: boolean) => {
    setStaffActionError('');
    try {
      setStaffSubmitting(true);
      await onVerifyPayment?.(due.sectionCode, verified, staffRemarks);
      setStaffRemarks('');
    } catch (err: any) {
      setStaffActionError(err.message || 'Verification failed.');
    } finally {
      setStaffSubmitting(false);
    }
  };

  // State-specific border & background styles
  const rowStyle = () => {
    switch (due.status) {
      case 'PENDING_REVIEW':
        return 'border-[#E5E3DD] bg-[#FAFAF8] text-[#55534E]';
      case 'DUE_FLAGGED':
        return 'border-[#FCA5A5] bg-[#FFFBFB] text-[#1F2937] shadow-xs ring-1 ring-[#F87171]/20';
      case 'PAYMENT_SUBMITTED':
        return 'border-[#C7D2FE] bg-[#F8F9FE] text-[#1F2937]';
      case 'CLEARED':
        return 'border-[#D1E7DD] bg-white text-[#1F2937]';
      default:
        return 'border-[#E5E3DD] bg-white';
    }
  };

  return (
    <div
      id={`due-row-${due.sectionCode}`}
      className={`rounded-sm border transition-all overflow-hidden ${rowStyle()}`}
    >
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#F0EFEB] text-[#5F5B52]">
              {due.tier === 1 ? 'Tier 1' : 'Tier 2'} • {due.sectionCode}
            </span>
            <StatusBadge status={due.status} amount={due.amount} size="sm" />
          </div>

          <h3 className="font-semibold text-xs sm:text-sm text-[#1A1A1A] truncate">
            {due.sectionName}
          </h3>

          {due.remarks && (
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
              <span className="font-medium text-slate-700">Remarks:</span> {due.remarks}
            </p>
          )}

          {due.paymentReference && (
            <p className="text-[11px] text-indigo-700 mt-1 font-mono font-medium">
              Submitted UTR: <span className="font-bold underline">{due.paymentReference}</span>
              {due.paymentSubmittedAt && (
                <span className="text-slate-400 ml-1">
                  ({new Date(due.paymentSubmittedAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Right CTA / Action buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {/* Student View Action: If due flagged, show Pay / Submit UTR */}
          {!isStaffView && due.status === 'DUE_FLAGGED' && (
            <button
              id={`pay-due-btn-${due.sectionCode}`}
              type="button"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition-colors min-h-[40px] sm:min-h-0 cursor-pointer"
            >
              <CreditCard size={14} className="shrink-0" />
              <span>Settle ₹{due.amount.toLocaleString('en-IN')}</span>
            </button>
          )}

          {/* Student View: Pending review banner */}
          {!isStaffView && due.status === 'PENDING_REVIEW' && (
            <span className="text-xs text-slate-500 italic flex items-center gap-1 py-1">
              <Lock size={12} className="shrink-0 text-slate-400" />
              Awaiting authority evaluation
            </span>
          )}

          {/* Expand Details / Signature button */}
          {due.signStamp && (
            <button
              id={`toggle-sig-${due.sectionCode}`}
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors min-h-[40px] sm:min-h-0 cursor-pointer"
            >
              <Shield size={13} className="text-emerald-600 shrink-0" />
              <span>{expanded ? 'Hide Stamp' : 'View Stamp'}</span>
              {expanded ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
            </button>
          )}
        </div>
      </div>

      {/* Student Payment Submission Drawer */}
      {!isStaffView && showPaymentForm && due.status === 'DUE_FLAGGED' && (
        <div className="p-3.5 bg-rose-50 border-t border-rose-200 text-xs">
          <form onSubmit={handleStudentSubmitPayment} className="space-y-3">
            <div className="flex items-start gap-2.5 text-rose-900">
              <Info size={16} className="shrink-0 mt-0.5 text-rose-700" />
              <div>
                <p className="font-semibold text-xs sm:text-sm">
                  Online Due Settlement for {due.sectionName}
                </p>
                <p className="text-rose-800 mt-0.5 text-xs leading-relaxed">
                  Amount fixed by department: <span className="font-mono font-bold">₹{due.amount.toLocaleString('en-IN')}</span>.
                  Dues are staff-controlled and cannot be altered. Pay via SBI Collect / RGUKT Payment Gateway, then paste the transaction UTR number below.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 text-xs">
                Bank Transaction / UTR / Reference Number:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id={`utr-input-${due.sectionCode}`}
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN2024090688921"
                  className="w-full sm:flex-1 px-3 py-2 border border-slate-300 rounded-sm font-mono text-xs sm:text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-[#DC2626] min-h-[42px]"
                  required
                />
                <button
                  id={`submit-utr-btn-${due.sectionCode}`}
                  type="submit"
                  disabled={submittingPayment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F5C55] hover:bg-[#0C4742] text-white rounded-sm font-semibold text-xs transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
                >
                  <Send size={13} className="shrink-0" />
                  <span>{submittingPayment ? 'Submitting...' : 'Submit UTR'}</span>
                </button>
              </div>
            </div>

            {paymentError && (
              <p className="text-rose-600 font-medium text-xs">{paymentError}</p>
            )}
          </form>
        </div>
      )}

      {/* Staff Actions Control Drawer */}
      {isStaffView && (
        <div className="p-3.5 bg-slate-50 border-t border-[#E5E3DD] text-xs">
          {staffActionError && (
            <div className="mb-2.5 p-2 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 font-medium text-xs">
              {staffActionError}
            </div>
          )}

          {/* If Pending review: Staff can enter ₹0 or a specific due amount */}
          {due.status === 'PENDING_REVIEW' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 font-semibold text-[#33396B] text-xs sm:text-sm">
                <Shield size={15} className="shrink-0" />
                <span>Authority Action: Record Due or Clear Section</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">
                    Due Amount (₹) — 0 for No Dues:
                  </label>
                  <input
                    id={`staff-amount-input-${due.sectionCode}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={staffAmount}
                    onChange={(e) => setStaffAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm font-mono text-xs bg-white min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">
                    Audit Remarks:
                  </label>
                  <input
                    id={`staff-remarks-input-${due.sectionCode}`}
                    type="text"
                    placeholder="e.g. Lab breakage fine / All inventory returned"
                    value={staffRemarks}
                    onChange={(e) => setStaffRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs bg-white min-h-[40px]"
                  />
                </div>

                <div className="flex flex-col xs:flex-row sm:flex-row items-stretch gap-2 sm:col-span-2 lg:col-span-1">
                  <button
                    id={`staff-clear-zero-btn-${due.sectionCode}`}
                    type="button"
                    disabled={staffSubmitting || (typeof staffAmount === 'number' && staffAmount > 0)}
                    onClick={() => handleStaffRecordDue(0)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm font-semibold text-xs transition-colors disabled:opacity-40 min-h-[40px] cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Clear ₹0</span>
                  </button>

                  <button
                    id={`staff-flag-due-btn-${due.sectionCode}`}
                    type="button"
                    disabled={staffSubmitting || typeof staffAmount !== 'number' || staffAmount <= 0}
                    onClick={() => handleStaffRecordDue(staffAmount as number)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-sm font-semibold text-xs transition-colors disabled:opacity-40 min-h-[40px] cursor-pointer"
                  >
                    <span>Flag ₹{staffAmount || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Payment submitted: Staff verifies UTR */}
          {due.status === 'PAYMENT_SUBMITTED' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-semibold text-[#3730A3] text-xs sm:text-sm">
                  Student submitted payment for ₹{due.amount.toLocaleString('en-IN')}:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold bg-white px-2.5 py-1 border border-[#C7D2FE] rounded text-[#1F2937] self-start sm:self-auto break-all">
                  UTR: {due.paymentReference}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id={`verify-remarks-input-${due.sectionCode}`}
                  type="text"
                  placeholder="Verification remarks (e.g. Bank credit reconciled in ledger)"
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border border-[#D1D5DB] rounded text-xs bg-white min-h-[42px]"
                />
                <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    id={`staff-approve-payment-btn-${due.sectionCode}`}
                    type="button"
                    disabled={staffSubmitting}
                    onClick={() => handleStaffVerify(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded font-semibold text-xs transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Verify & Clear (₹0)</span>
                  </button>

                  <button
                    id={`staff-reject-payment-btn-${due.sectionCode}`}
                    type="button"
                    disabled={staffSubmitting}
                    onClick={() => handleStaffVerify(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded font-semibold text-xs transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
                  >
                    <XCircle size={14} className="shrink-0" />
                    <span>Reject UTR</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Cleared: show info */}
          {due.status === 'CLEARED' && (
            <div className="text-[#065F46] font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span>Section clearance confirmed and digitally signed.</span>
              <span className="text-[11px] text-[#047857]">Signed by {due.updatedByStaffName || 'Officer'}</span>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Cryptographic Sign Stamp details */}
      {expanded && due.signStamp && (
        <div className="p-4 bg-[#FAFAF8] border-t border-[#E5E3DD]">
          <SignatureBlock stamp={due.signStamp} />
        </div>
      )}
    </div>
  );
};
