import React, { useState } from 'react';
import { DueRecord, StaffAccount, StudentProfile } from '../types';
import { getAllStudents, executiveSign } from '../services/dataStore';
import { StatusBadge } from '../components/StatusBadge';
import {
  Award,
  Search,
  CheckCircle2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

interface ExecutiveDeskProps {
  officer: StaffAccount;
  onRefreshData?: () => void;
}

export const ExecutiveDesk: React.FC<ExecutiveDeskProps> = ({ officer, onRefreshData }) => {
  const [students, setStudents] = useState<StudentProfile[]>(getAllStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoll, setSelectedRoll] = useState<string>('R200142'); // Or R200188
  const [signingLoading, setSigningLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshData = () => {
    setStudents(getAllStudents());
    onRefreshData?.();
  };

  // Determine officer role type: HOD vs DSW vs REGISTRAR
  const officerRoleType: 'HOD' | 'DSW' | 'REGISTRAR' =
    officer.role === 'HOD' || officer.id.includes('HOD')
      ? 'HOD'
      : officer.role === 'DSW' || officer.id.includes('DSW')
      ? 'DSW'
      : 'REGISTRAR';

  // Filter students based on role jurisdiction
  const eligibleStudents = students.filter((s) => {
    if (officerRoleType === 'HOD' && officer.allowedBranch) {
      return s.branch === officer.allowedBranch;
    }
    return true;
  });

  const filteredStudents = eligibleStudents.filter(
    (s) =>
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent =
    filteredStudents.find((s) => s.rollNo === selectedRoll) || filteredStudents[0] || students[0];

  // Analyze Gate Readiness for the selected student
  const studentDues = selectedStudent ? (Object.values(selectedStudent.dues) as DueRecord[]) : [];
  const tier1Dues = studentDues.filter((d) => d.tier === 1);
  const tier2Dues = studentDues.filter((d) => d.tier === 2);

  const tier1ClearedCount = tier1Dues.filter((d) => d.status === 'CLEARED').length;
  const tier2ClearedCount = tier2Dues.filter((d) => d.status === 'CLEARED').length;

  const allTier1Cleared = tier1ClearedCount === tier1Dues.length && tier1Dues.length > 0;
  const allLabsCleared = tier2ClearedCount === tier2Dues.length && tier2Dues.length > 0;

  const hodSigned = selectedStudent?.executiveApprovals?.hod?.signed;
  const dswSigned = selectedStudent?.executiveApprovals?.dsw?.signed;
  const regSigned = selectedStudent?.executiveApprovals?.registrar?.signed;

  // Determine if this officer can sign:
  let canSign = false;
  let lockReason = '';

  if (officerRoleType === 'HOD') {
    if (!allLabsCleared) {
      lockReason = `Locked: Cannot endorse until 100% of branch laboratories are cleared (${tier2ClearedCount}/${tier2Dues.length} cleared).`;
    } else if (hodSigned) {
      lockReason = 'Already Endorsed by HOD.';
    } else {
      canSign = true;
    }
  } else if (officerRoleType === 'DSW') {
    if (!allTier1Cleared) {
      lockReason = `Locked: Tier 1 offices incomplete (${tier1ClearedCount}/${tier1Dues.length} cleared).`;
    } else if (!hodSigned) {
      lockReason = 'Locked: Requires HOD endorsement before DSW review.';
    } else if (dswSigned) {
      lockReason = 'Already Approved by DSW.';
    } else {
      canSign = true;
    }
  } else {
    // REGISTRAR
    if (!dswSigned) {
      lockReason = 'Locked: Requires Dean of Students Welfare (DSW) seal first.';
    } else if (regSigned) {
      lockReason = 'Final University Institutional Seal already affixed.';
    } else {
      canSign = true;
    }
  }

  const handleExecuteSign = async () => {
    if (!selectedStudent || !canSign) return;
    setSigningLoading(true);
    setFeedback(null);

    try {
      const res = await executiveSign(
        selectedStudent.rollNo,
        officerRoleType,
        officer
      );
      setSigningLoading(false);
      setFeedback({ type: 'success', message: res.message });
      refreshData();
    } catch (err: any) {
      setSigningLoading(false);
      setFeedback({ type: 'error', message: err.message || 'Signing failed.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Dignified Institutional Seal Header */}
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FDF2F0] border border-[#F8C8C0] flex items-center justify-center text-[#5C2A1E] shrink-0">
              <Award size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-official-serif">
                  Executive Clearance Desk: {officerRoleType}
                </h1>
                <span className="font-mono-code text-xs px-2.5 py-0.5 rounded bg-[#FDF2F0] text-[#5C2A1E] border border-[#F8C8C0] font-bold">
                  Tier 3 Authority
                </span>
              </div>
              <p className="text-xs text-[#615E56] mt-1">
                Executive Officer: <strong className="text-[#1A1A1A]">{officer.name}</strong> • {officer.designation} • ID: <span className="font-mono-code">{officer.id}</span>
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E5E3DD] text-[#37352F]">
            Jurisdiction: {officer.allowedBranch ? `${officer.allowedBranch} Department` : 'University-Wide'}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Candidate Ledger */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-[#E5E3DD] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <User size={16} className="text-[#5C2A1E]" />
                <span>Executive Docket</span>
              </h2>
              <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-[#F0EFEB] text-[#55534E]">
                {filteredStudents.length} Candidates
              </span>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878274]" />
              <input
                type="text"
                placeholder="Search Roll No (e.g. R200188)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D5D2C7] bg-[#FAF9F5] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredStudents.map((s) => {
                const isSelected = s.rollNo === selectedStudent?.rollNo;
                const isCertified = s.certificateIssued;

                return (
                  <button
                    key={s.rollNo}
                    id={`exec-student-row-${s.rollNo}`}
                    type="button"
                    onClick={() => {
                      setSelectedRoll(s.rollNo);
                      setFeedback(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#5C2A1E] bg-[#FFF8F6] shadow-xs'
                        : 'border-[#E5E3DD] bg-white hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-code font-bold text-xs text-[#1A1A1A]">
                        {s.rollNo}
                      </span>
                      {isCertified ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-semibold">
                          Certified
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-semibold">
                          Pending Exec
                        </span>
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

        {/* Right: Executive Sign-off Terminal */}
        <div className="lg:col-span-8 space-y-4">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-[#E5E3DD] p-6 shadow-xs space-y-6">
              {/* Candidate Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E3DD]">
                <div>
                  <span className="text-[11px] font-bold text-[#5C2A1E] uppercase tracking-wider">
                    Executive Docket File
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A] font-official-serif">
                    {selectedStudent.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#615E56] mt-0.5">
                    <span className="font-mono font-semibold">{selectedStudent.rollNo}</span>
                    <span>•</span>
                    <span>{selectedStudent.branch}</span>
                    <span>•</span>
                    <span>Batch {selectedStudent.batch}</span>
                    <span>•</span>
                    <span>CGPA: {selectedStudent.cgpa}</span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {selectedStudent.certificateIssued ? (
                    <StatusBadge status="CERTIFIED" size="md" />
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold">
                      Under Review
                    </span>
                  )}
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
                    <AlertTriangle size={16} className="text-[#DC2626] shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Hierarchy Audit Checklist */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DD] space-y-3">
                <h4 className="font-bold text-xs text-[#37352F] uppercase tracking-wider">
                  Sequential Clearance Audit Checks:
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {allTier1Cleared ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#DC2626] shrink-0" />
                      )}
                      <span>Tier 1 General Offices (7/7):</span>
                    </div>
                    <span className="font-mono font-bold self-end xs:self-auto">
                      {tier1ClearedCount} / {tier1Dues.length} Cleared
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {allLabsCleared ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#DC2626] shrink-0" />
                      )}
                      <span>Tier 2 {selectedStudent.branch} Laboratories:</span>
                    </div>
                    <span className="font-mono font-bold self-end xs:self-auto">
                      {tier2ClearedCount} / {tier2Dues.length} Cleared
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {hodSigned ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#878274] shrink-0" />
                      )}
                      <span>Head of Department (HOD) Endorsement:</span>
                    </div>
                    <span className="font-semibold self-end xs:self-auto">
                      {hodSigned ? selectedStudent.executiveApprovals.hod.officerName : 'Pending'}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {selectedStudent.studentAcknowledged ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#878274] shrink-0" />
                      )}
                      <span>Student Digital e-Signature Acknowledgement:</span>
                    </div>
                    <span className="font-semibold self-end xs:self-auto">
                      {selectedStudent.studentAcknowledged ? 'Signed' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {dswSigned ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#878274] shrink-0" />
                      )}
                      <span>Dean of Students Welfare (DSW) Seal:</span>
                    </div>
                    <span className="font-semibold self-end xs:self-auto">
                      {dswSigned ? selectedStudent.executiveApprovals.dsw.officerName : 'Pending'}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-lg bg-white border border-[#E5E3DD]">
                    <div className="flex items-center gap-2">
                      {regSigned ? (
                        <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                      ) : (
                        <Lock size={15} className="text-[#878274] shrink-0" />
                      )}
                      <span>Registrar / Director Clearance Seal:</span>
                    </div>
                    <span className="font-semibold self-end xs:self-auto">
                      {regSigned ? selectedStudent.executiveApprovals.registrar.officerName : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authority Sign Action Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#FFF8F6] border border-[#F8C8C0] space-y-4">
                <div className="flex items-center gap-2">
                  <Fingerprint size={20} className="text-[#5C2A1E] shrink-0" />
                  <h4 className="font-bold text-sm text-[#5C2A1E]">
                    Affix Executive Cryptographic Endorsement
                  </h4>
                </div>

                <p className="text-xs text-[#52504A] leading-relaxed">
                  By clicking below, you affix your official digital seal and authorization hash to candidate <strong>{selectedStudent.name}</strong> ({selectedStudent.rollNo}).
                  This action is recorded in the permanent audit chain with a deterministic SHA-256 stamp.
                </p>

                {canSign ? (
                  <button
                    id="exec-sign-btn"
                    type="button"
                    disabled={signingLoading}
                    onClick={handleExecuteSign}
                    className="w-full py-3 px-4 rounded-xl bg-[#5C2A1E] hover:bg-[#461F16] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer"
                  >
                    <Award size={18} className="shrink-0" />
                    <span>
                      {signingLoading
                        ? 'Computing SHA-256 SignStamp...'
                        : `Affix Official Seal of ${officerRoleType}`}
                    </span>
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-[#F8C8C0] text-xs text-[#991B1B] flex items-center gap-2 font-medium">
                    <Lock size={14} className="shrink-0" />
                    <span>{lockReason}</span>
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
