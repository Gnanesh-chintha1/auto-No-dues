import React, { useState } from 'react';
import { StaffAccount, StudentProfile } from '../types';
import { getAllStudents, recordStaffDue, verifyAndSignPayment } from '../services/dataStore';
import { StatusBadge } from '../components/StatusBadge';
import { SignatureBlock } from '../components/SignatureBlock';
import { TIER1_SECTIONS } from '../services/rguktCurriculum';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  XCircle,
  Filter,
  User,
} from 'lucide-react';

interface GeneralSectionDeskProps {
  staff: StaffAccount;
  onRefreshData?: () => void;
}

export const GeneralSectionDesk: React.FC<GeneralSectionDeskProps> = ({ staff, onRefreshData }) => {
  const [students, setStudents] = useState<StudentProfile[]>(getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string>('R200142'); // Default to Alex for quick demo

  // Action form state for selected student
  const [staffAmount, setStaffAmount] = useState<number | ''>('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Map staff domain to section definition
  const sectionDef = TIER1_SECTIONS.find((s) => s.id === staff.allowedDomain) || {
    id: staff.allowedDomain as any,
    code: `T1_${staff.allowedDomain}`,
    name: staff.allowedDomain,
    category: 'University Section',
    defaultRemarks: 'Cleared by authority.',
    responsibleOfficerRole: staff.designation,
  };

  const refreshStudents = () => {
    const fresh = getAllStudents();
    setStudents(fresh);
    onRefreshData?.();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find((s) => s.rollNo === selectedStudentRoll) || students[0];

  // Due item for the selected student in THIS staff member's section
  const currentSectionDue = selectedStudent ? selectedStudent.dues[sectionDef.code] : null;

  const handleRecordDue = async (amount: number) => {
    if (!selectedStudent || !currentSectionDue) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const res = await recordStaffDue(
        selectedStudent.rollNo,
        currentSectionDue.sectionCode,
        amount,
        staffRemarks || (amount === 0 ? 'Confirmed ₹0 / No Dues' : `Dues recorded: ₹${amount}`),
        staff
      );
      setActionLoading(false);
      setActionFeedback({ type: 'success', message: res.message });
      setStaffRemarks('');
      setStaffAmount('');
      refreshStudents();
    } catch (err: any) {
      setActionLoading(false);
      setActionFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedStudent || !currentSectionDue) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const res = await verifyAndSignPayment(
        selectedStudent.rollNo,
        currentSectionDue.sectionCode,
        verified,
        staff,
        staffRemarks
      );
      setActionLoading(false);
      setActionFeedback({
        type: verified ? 'success' : 'error',
        message: res.message,
      });
      setStaffRemarks('');
      refreshStudents();
    } catch (err: any) {
      setActionLoading(false);
      setActionFeedback({ type: 'error', message: err.message || 'Verification failed.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Officer Authority Header */}
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#33396B] shrink-0">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                  {sectionDef.name}
                </h1>
                <span className="font-mono-code text-xs px-2.5 py-0.5 rounded bg-[#EEF2FF] text-[#33396B] border border-[#C7D2FE] font-bold">
                  {sectionDef.code}
                </span>
              </div>
              <p className="text-xs text-[#615E56] mt-1">
                Authorized Officer: <strong className="text-[#1A1A1A]">{staff.name}</strong> ({staff.designation}) • Staff ID: <span className="font-mono-code">{staff.id}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-[#615E56] hidden sm:block">
            <span className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E5E3DD] font-medium">
              Domain Scope Locked to {staff.allowedDomain}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Column Student Selector, Right Column Clearance Action Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Enrolled Students Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-[#E5E3DD] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <User size={16} className="text-[#33396B]" />
                <span>Student Clearance Ledger</span>
              </h2>
              <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-[#F0EFEB] text-[#55534E]">
                {filteredStudents.length} Students
              </span>
            </div>

            {/* Search filter */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878274]" />
              <input
                id="search-student-input"
                type="text"
                placeholder="Search Roll No (e.g. R200142)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D5D2C7] bg-[#FAF9F5] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#33396B]"
              />
            </div>

            {/* Student list items */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((s) => {
                const sDue = s.dues[sectionDef.code];
                const isSelected = s.rollNo === selectedStudent?.rollNo;

                return (
                  <button
                    key={s.rollNo}
                    id={`student-ledger-item-${s.rollNo}`}
                    type="button"
                    onClick={() => {
                      setSelectedStudentRoll(s.rollNo);
                      setActionFeedback(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#33396B] bg-[#F4F5FB] shadow-xs'
                        : 'border-[#E5E3DD] bg-white hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-code font-bold text-xs text-[#1A1A1A]">
                        {s.rollNo}
                      </span>
                      {sDue ? (
                        <StatusBadge status={sDue.status} amount={sDue.amount} size="sm" />
                      ) : (
                        <span className="text-[10px] text-[#878274]">N/A</span>
                      )}
                    </div>
                    <div className="font-semibold text-xs text-[#37352F] truncate">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-[#615E56]">
                      {s.branch} • Batch {s.batch}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Departmental Action Terminal (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedStudent && currentSectionDue ? (
            <div className="bg-white rounded-2xl border border-[#E5E3DD] p-6 shadow-xs space-y-6">
              {/* Selected Student Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E3DD]">
                <div>
                  <span className="text-[11px] font-bold text-[#33396B] uppercase tracking-wider">
                    Candidate Evaluation
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {selectedStudent.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#615E56] mt-0.5">
                    <span className="font-mono font-semibold">{selectedStudent.rollNo}</span>
                    <span>•</span>
                    <span>{selectedStudent.branch} ({selectedStudent.program})</span>
                    <span>•</span>
                    <span>CGPA: {selectedStudent.cgpa}</span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <StatusBadge
                    status={currentSectionDue.status}
                    amount={currentSectionDue.amount}
                    size="md"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {actionFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    actionFeedback.type === 'success'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                  }`}
                >
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-[#DC2626] shrink-0" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              {/* Staff-First State Machine Execution */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DD] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#33396B] shrink-0" />
                    <span>Departmental Action Terminal ({sectionDef.name})</span>
                  </h4>
                  <span className="text-xs text-[#615E56]">
                    Sequence: Staff Entry → Student Payment → Staff Verify & Sign
                  </span>
                </div>

                {/* State 1: PENDING_REVIEW (Staff must enter first) */}
                {currentSectionDue.status === 'PENDING_REVIEW' && (
                  <div className="space-y-4 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-3 rounded-lg bg-white border border-[#E5E3DD] text-xs text-[#44413B] leading-relaxed">
                      <strong className="text-[#1A1A1A]">Staff-First Rule Enforced:</strong> This line item is currently locked in the student's portal as <em>"Pending review"</em>. The student cannot self-declare dues. You must now either confirm ₹0 (No Dues) or record an outstanding amount.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                          Due Amount (₹) — Enter 0 for No Dues:
                        </label>
                        <input
                          id="desk-amount-input"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={staffAmount}
                          onChange={(e) => setStaffAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] font-mono text-sm bg-white min-h-[42px]"
                        />
                        <span className="text-[11px] text-[#78756E] mt-0.5 block">
                          Leave blank or 0 to confirm clear status
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                          Official Audit Remarks:
                        </label>
                        <input
                          id="desk-remarks-input"
                          type="text"
                          placeholder="e.g. 2 Library books returned / Mess balance cleared"
                          value={staffRemarks}
                          onChange={(e) => setStaffRemarks(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        id="desk-confirm-zero-btn"
                        type="button"
                        disabled={actionLoading || (typeof staffAmount === 'number' && staffAmount > 0)}
                        onClick={() => handleRecordDue(0)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>Confirm ₹0 (No Dues) & Digitally Sign</span>
                      </button>

                      <button
                        id="desk-flag-due-btn"
                        type="button"
                        disabled={actionLoading || typeof staffAmount !== 'number' || staffAmount <= 0}
                        onClick={() => handleRecordDue(staffAmount as number)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Flag Due (₹{staffAmount || 0})</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* State 2: DUE_FLAGGED */}
                {currentSectionDue.status === 'DUE_FLAGGED' && (
                  <div className="space-y-3 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B]">
                      <p className="font-bold">Due Amount Recorded: ₹{currentSectionDue.amount.toLocaleString('en-IN')}</p>
                      <p className="mt-0.5">Remarks: {currentSectionDue.remarks || 'Outstanding fine recorded.'}</p>
                      <p className="mt-1 text-[11px] text-[#7F1D1D]">
                        Awaiting student payment reference (UTR). The student cannot change the amount and must submit proof of payment.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleRecordDue(0)}
                        className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-white border border-[#D5D2C7] text-xs font-semibold text-[#37352F] hover:bg-[#F0EFEB] transition-colors min-h-[42px] cursor-pointer"
                      >
                        Waive / Override Due to ₹0
                      </button>
                    </div>
                  </div>
                )}

                {/* State 3: PAYMENT_SUBMITTED (Staff verifies student's UTR) */}
                {currentSectionDue.status === 'PAYMENT_SUBMITTED' && (
                  <div className="space-y-4 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-[#3730A3]">Student Payment Proof Received:</span>
                        <span className="font-mono font-bold text-xs sm:text-sm bg-white px-2.5 py-1 rounded border border-[#C7D2FE] text-[#1E2554] break-all self-start sm:self-auto">
                          UTR: {currentSectionDue.paymentReference}
                        </span>
                      </div>
                      <p className="text-[#4338CA]">
                        Recorded Amount: <strong className="font-mono">₹{currentSectionDue.amount.toLocaleString('en-IN')}</strong>. Please reconcile with university SBI bank statement.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#37352F] mb-1">
                        Staff Verification Remarks (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Reconciled in SBI account statement on 06-Sep-2026"
                        value={staffRemarks}
                        onChange={(e) => setStaffRemarks(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white min-h-[42px]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        id="desk-approve-payment-btn"
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVerifyPayment(true)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>Verify Payment, Clear (₹0) & Affix SignStamp</span>
                      </button>

                      <button
                        id="desk-reject-payment-btn"
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVerifyPayment(false)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <XCircle size={15} className="shrink-0" />
                        <span>Reject Invalid UTR</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* State 4: CLEARED (Digital SignStamp generated) */}
                {currentSectionDue.status === 'CLEARED' && (
                  <div className="space-y-3 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={16} />
                        <span>Clearance Complete & Signed</span>
                      </div>
                      <span className="font-mono-code font-bold">₹0 Due</span>
                    </div>

                    {currentSectionDue.signStamp && (
                      <SignatureBlock stamp={currentSectionDue.signStamp} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E3DD] p-12 text-center text-[#878274]">
              Select a student from the candidate ledger to review clearance status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
