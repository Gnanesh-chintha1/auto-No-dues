import React, { useState } from 'react';
import { BranchCode, CurriculumLab, StaffAccount, StudentProfile } from '../types';
import { getAllStudents, recordStaffDue, verifyAndSignPayment } from '../services/dataStore';
import { getCurriculumForStudent } from '../services/rguktCurriculum';
import { StatusBadge } from '../components/StatusBadge';
import { SignatureBlock } from '../components/SignatureBlock';
import { AnimatedRupeeAmount } from '../components/AnimatedRupeeAmount';
import { flashLedgerRow } from '../utils/animation';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  XCircle,
  ChevronRight,
  User,
  Sliders,
} from 'lucide-react';

interface LabClearanceDeskProps {
  staff: StaffAccount;
  onRefreshData?: () => void;
}

export const LabClearanceDesk: React.FC<LabClearanceDeskProps> = ({ staff, onRefreshData }) => {
  const branch: BranchCode = staff.allowedBranch || 'CSE';
  const labs: CurriculumLab[] = getCurriculumForStudent(branch);

  const [selectedLabCode, setSelectedLabCode] = useState<string>(staff.allowedLabCode || labs[0]?.labCode || 'CSE-201');
  const [students, setStudents] = useState<StudentProfile[]>(getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string>('R200142');

  const [staffAmount, setStaffAmount] = useState<number | ''>('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeLab = labs.find((l) => l.labCode === selectedLabCode) || labs[0];
  const sectionCode = `T2_${branch}_${activeLab?.labCode}`;

  const refreshData = () => {
    setStudents(getAllStudents());
    onRefreshData?.();
  };

  // Filter students enrolled in this branch
  const branchStudents = students.filter(
    (s) =>
      s.branch === branch &&
      (s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedStudent =
    branchStudents.find((s) => s.rollNo === selectedStudentRoll) || branchStudents[0] || students[0];

  const currentDue = selectedStudent?.dues[sectionCode];

  const handleRecordDue = async (amount: number) => {
    if (!selectedStudent || !currentDue) return;
    const targetRoll = selectedStudent.rollNo;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await recordStaffDue(
        selectedStudent.rollNo,
        sectionCode,
        amount,
        staffRemarks || (amount === 0 ? 'Terminal lab practical & equipment cleared' : `Equipment breakage due: ₹${amount}`),
        staff
      );
      setActionLoading(false);
      setFeedback({ type: 'success', message: res.message });
      setStaffRemarks('');
      setStaffAmount('');
      refreshData();

      // GSAP soft highlight flash on updated student item
      setTimeout(() => {
        const rowEl = document.getElementById(`lab-student-row-${targetRoll}`);
        if (rowEl) {
          flashLedgerRow(rowEl, amount === 0 ? 'cleared' : 'flagged');
        }
      }, 100);
    } catch (err: any) {
      setActionLoading(false);
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedStudent || !currentDue) return;
    const targetRoll = selectedStudent.rollNo;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await verifyAndSignPayment(
        selectedStudent.rollNo,
        sectionCode,
        verified,
        staff,
        staffRemarks
      );
      setActionLoading(false);
      setFeedback({ type: verified ? 'success' : 'error', message: res.message });
      setStaffRemarks('');
      refreshData();

      // GSAP soft highlight flash on verified/rejected student item
      setTimeout(() => {
        const rowEl = document.getElementById(`lab-student-row-${targetRoll}`);
        if (rowEl) {
          flashLedgerRow(rowEl, verified ? 'cleared' : 'flagged');
        }
      }, 100);
    } catch (err: any) {
      setActionLoading(false);
      setFeedback({ type: 'error', message: err.message || 'Verification failed.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#33396B] shrink-0">
              <FlaskConical size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                  Tier 2: {branch} Department Laboratories
                </h1>
                <span className="font-mono-code text-xs px-2.5 py-0.5 rounded bg-[#EEF2FF] text-[#33396B] border border-[#C7D2FE] font-bold">
                  {branch} Branch Desk
                </span>
              </div>
              <p className="text-xs text-[#615E56] mt-1">
                Lab In-Charge: <strong className="text-[#1A1A1A]">{staff.name}</strong> ({staff.designation}) • Staff ID: <span className="font-mono-code">{staff.id}</span>
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E5E3DD] text-[#37352F]">
            {labs.length} Curriculum Labs Managed
          </div>
        </div>
      </div>

      {/* Lab Selector Bar */}
      <div className="bg-white border border-[#E5E3DD] rounded-xl p-3 shadow-xs">
        <div className="text-xs font-bold text-[#37352F] uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Sliders size={14} className="text-[#33396B]" />
          <span>Select Laboratory Desk:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {labs.map((lab) => {
            const isSelected = lab.labCode === activeLab?.labCode;
            return (
              <button
                key={lab.labCode}
                id={`lab-selector-btn-${lab.labCode}`}
                type="button"
                onClick={() => {
                  setSelectedLabCode(lab.labCode);
                  setFeedback(null);
                }}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#33396B] text-white border-[#33396B] shadow-xs'
                    : 'bg-[#FAF9F5] hover:bg-[#F2EFE6] border-[#E5E3DD] text-[#37352F]'
                }`}
              >
                <span>{lab.labCode}</span>
                <span className="text-[10px] ml-1.5 opacity-75">({lab.yearLevel})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Students for this branch */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-[#E5E3DD] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <User size={16} className="text-[#33396B]" />
                <span>{branch} Candidates</span>
              </h2>
              <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-[#F0EFEB] text-[#55534E]">
                {branchStudents.length} Students
              </span>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878274]" />
              <input
                type="text"
                placeholder="Search Candidate Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D5D2C7] bg-[#FAF9F5] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {branchStudents.map((s) => {
                const sDue = s.dues[sectionCode];
                const isSelected = s.rollNo === selectedStudent?.rollNo;

                return (
                  <button
                    key={s.rollNo}
                    id={`lab-student-row-${s.rollNo}`}
                    type="button"
                    onClick={() => {
                      setSelectedStudentRoll(s.rollNo);
                      setFeedback(null);
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
                      {sDue && <StatusBadge status={sDue.status} amount={sDue.amount} size="sm" />}
                    </div>
                    <div className="font-semibold text-xs text-[#37352F] truncate">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-[#615E56]">
                      {s.branch} • Year: {s.year}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Lab Clearance Terminal */}
        <div className="lg:col-span-8 space-y-4">
          {selectedStudent && currentDue ? (
            <div className="bg-white rounded-2xl border border-[#E5E3DD] p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E3DD]">
                <div>
                  <span className="text-[11px] font-bold text-[#33396B] uppercase tracking-wider">
                    {activeLab.labCode} Clearance Evaluation
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {activeLab.labName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#615E56] mt-0.5">
                    <span>Student: <strong className="text-[#1A1A1A]">{selectedStudent.name}</strong> ({selectedStudent.rollNo})</span>
                    <span>•</span>
                    <span>Credits: {activeLab.credits}</span>
                    <span>•</span>
                    <span>Level: {activeLab.yearLevel}</span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <StatusBadge status={currentDue.status} amount={currentDue.amount} size="md" />
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-[#DC2626] shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Action Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#FAF9F5] border border-[#E5E3DD] space-y-4">
                <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#33396B] shrink-0" />
                  <span>Lab Clearance Action ({activeLab.labCode})</span>
                </h4>

                {/* State 1: PENDING REVIEW */}
                {currentDue.status === 'PENDING_REVIEW' && (
                  <div className="space-y-4 pt-2 border-t border-[#E5E3DD]">
                    <p className="text-xs text-[#52504A]">
                      Staff-first sequence active: Record ₹0 if all lab equipment, components, and practical assignments are cleared, or flag a breakage fine amount.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#37352F] mb-1">
                          Breakage / Damage Fee (₹) — 0 for No Dues:
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={staffAmount}
                          onChange={(e) => setStaffAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] font-mono text-sm bg-white min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#37352F] mb-1">
                          Remarks / Equipment Log:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CRO probe returned intact / Record submitted"
                          value={staffRemarks}
                          onChange={(e) => setStaffRemarks(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        disabled={actionLoading || (typeof staffAmount === 'number' && staffAmount > 0)}
                        onClick={() => handleRecordDue(0)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>Confirm ₹0 (Lab Cleared) & Digitally Sign</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading || typeof staffAmount !== 'number' || staffAmount <= 0}
                        onClick={() => handleRecordDue(staffAmount as number)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <AlertCircle size={15} className="shrink-0" />
                        <span>Flag Breakage Due (₹{staffAmount || 0})</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* State 2: DUE FLAGGED */}
                {currentDue.status === 'DUE_FLAGGED' && (
                  <div className="space-y-3 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B]">
                      <p className="font-bold flex items-center gap-1.5">
                        <span>Breakage Fine Active:</span>
                        <AnimatedRupeeAmount amount={currentDue.amount} className="text-sm font-bold" />
                      </p>
                      <p className="mt-0.5">Remarks: {currentDue.remarks}</p>
                      <p className="mt-1 text-[11px] text-[#7F1D1D]">
                        Student must submit bank transaction reference (UTR) to initiate verification.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRecordDue(0)}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-white border border-[#D5D2C7] text-xs font-semibold text-[#37352F] hover:bg-[#F0EFEB] transition-colors min-h-[42px] cursor-pointer"
                    >
                      Waive Breakage Due to ₹0
                    </button>
                  </div>
                )}

                {/* State 3: PAYMENT SUBMITTED */}
                {currentDue.status === 'PAYMENT_SUBMITTED' && (
                  <div className="space-y-4 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-[#3730A3]">Student Bank UTR:</span>
                        <span className="font-mono font-bold text-xs sm:text-sm bg-white px-2.5 py-1 rounded border border-[#C7D2FE] text-[#1E2554] break-all self-start sm:self-auto">
                          {currentDue.paymentReference}
                        </span>
                      </div>
                      <p className="text-[#4338CA] flex items-center gap-1.5">
                        <span>Amount:</span>
                        <AnimatedRupeeAmount amount={currentDue.amount} />
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVerifyPayment(true)}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
                      >
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>Verify & Sign Clearance (₹0)</span>
                      </button>

                      <button
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

                {/* State 4: CLEARED */}
                {currentDue.status === 'CLEARED' && (
                  <div className="space-y-3 pt-2 border-t border-[#E5E3DD]">
                    <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={15} />
                        Laboratory Cleared & Signed
                      </span>
                      <span className="font-mono-code font-bold">₹0 Due</span>
                    </div>

                    {currentDue.signStamp && <SignatureBlock stamp={currentDue.signStamp} />}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
