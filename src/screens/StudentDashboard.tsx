import React, { useState } from 'react';
import { DueRecord, StudentProfile } from '../types';
import { TierStepper } from '../components/TierStepper';
import { DueEntryRow } from '../components/DueEntryRow';
import { StatusBadge } from '../components/StatusBadge';
import {
  submitStudentPayment,
  studentAcknowledge,
  checkCertificateReadiness,
  generateCertificate,
} from '../services/dataStore';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  FileCheck2,
  Info,
  Bug,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile) => void;
  onViewCertificate: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onUpdateStudent,
  onViewCertificate,
}) => {
  const [activeTierTab, setActiveTierTab] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [defensiveError, setDefensiveError] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Group dues by tier
  const allDues = Object.values(student.dues) as DueRecord[];
  const tier1Dues = allDues.filter((d) => d.tier === 1);
  const tier2Dues = allDues.filter((d) => d.tier === 2);

  const tier1Cleared = tier1Dues.filter((d) => d.status === 'CLEARED').length;
  const tier2Cleared = tier2Dues.filter((d) => d.status === 'CLEARED').length;
  const totalTierDues = (tier1Dues.length + tier2Dues.length) || 1;
  const progressPercent = Math.min(100, Math.round(((tier1Cleared + tier2Cleared) / totalTierDues) * 100));

  const allLabsCleared = tier2Cleared === tier2Dues.length && tier2Dues.length > 0;
  const allTier1Cleared = tier1Cleared === tier1Dues.length && tier1Dues.length > 0;

  // Gate Check for Certificate
  const certGate = checkCertificateReadiness(student);


  // Submit UTR payment against a flagged due
  const handlePaymentSubmit = async (sectionCode: string, utr: string) => {
    try {
      const res = submitStudentPayment(student.rollNo, sectionCode, utr);
      onUpdateStudent(res.student);
      setNotification({
        type: 'success',
        message: `UTR reference ${utr} recorded for verification. Awaiting department staff approval.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Payment submission failed.' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Student Digital Acknowledgement
  const handleStudentAcknowledge = () => {
    try {
      const res = studentAcknowledge(student.rollNo);
      onUpdateStudent(res.student);
      setNotification({
        type: 'success',
        message: 'Digital e-signature recorded successfully. Ready for Executive Approvals.',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Acknowledgement failed.' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Legitimate certificate generator
  const handleGenerateCertificate = async () => {
    setDefensiveError(null);
    setGeneratingCert(true);
    try {
      const res = await generateCertificate(student.rollNo);
      onUpdateStudent(res.student);
      setGeneratingCert(false);
      onViewCertificate();
    } catch (err: any) {
      setGeneratingCert(false);
      setDefensiveError(err.message);
    }
  };

  // Dev-only Force Generate test: tests requirement 5 defensive check
  const handleForceGenerateDevTest = async () => {
    setDefensiveError(null);
    try {
      // Intentionally call the backend generateCertificate directly
      await generateCertificate(student.rollNo);
      onViewCertificate();
    } catch (err: any) {
      setDefensiveError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
      {/* Student Identity & High Density Progress Banner */}
      <div className="bg-white rounded-sm border border-[#E5E3DD] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-[#0F5C55]/10 border border-[#0F5C55]/20 flex items-center justify-center text-[#0F5C55] shrink-0 font-bold">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight">
                  {student.name}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#1A1A1A] font-semibold">
                  {student.rollNo}
                </span>
                {student.certificateIssued ? (
                  <StatusBadge status="CERTIFIED" size="sm" />
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-semibold">
                    Clearance In-Progress
                  </span>
                )}
              </div>

              <div className="flex items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 flex-wrap">
                <span>
                  <strong className="text-slate-700">Program:</strong> {student.program} ({student.year})
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-700">Branch:</strong> {student.branch}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-700">Batch:</strong> {student.batch}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-700">CGPA:</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{student.cgpa}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Progress & Certificate Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 w-full lg:w-auto">
            {/* Progress Gauge */}
            <div className="w-full sm:w-56 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Progress
                </span>
                <span className="text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full text-emerald-700 bg-emerald-100">
                  {progressPercent}%
                </span>
              </div>
              <div className="overflow-hidden h-2 rounded bg-emerald-100 flex">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"
                />
              </div>
            </div>

            {/* Certificate Action Gate Block */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              {student.certificateIssued ? (
                <button
                  id="view-cert-cta"
                  type="button"
                  onClick={() => {
                    console.log('Navigating to certificate view for student:', student.rollNo);
                    onViewCertificate();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm bg-[#0F5C55] hover:bg-[#0C4742] active:bg-[#093530] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer relative z-10 min-h-[40px] sm:min-h-0"
                >
                  <Award size={15} />
                  <span>View Certificate</span>
                </button>
              ) : certGate.isReady ? (
                <button
                  id="generate-cert-cta"
                  type="button"
                  disabled={generatingCert}
                  onClick={handleGenerateCertificate}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm bg-[#B8860B] hover:bg-[#9B7109] text-white font-semibold text-xs shadow-xs transition-colors min-h-[40px] sm:min-h-0 cursor-pointer"
                >
                  <Award size={15} />
                  <span>{generatingCert ? 'Generating Hash...' : 'Generate Certificate'}</span>
                </button>
              ) : (
                <div className="relative w-full sm:w-auto">
                  <button
                    id="locked-cert-pill"
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm bg-slate-100 text-slate-600 border border-slate-300 font-semibold text-xs cursor-help min-h-[40px] sm:min-h-0"
                  >
                    <Lock size={13} className="text-slate-500 shrink-0" />
                    <span>Certificate Locked</span>
                    <HelpCircle size={12} className="text-slate-400 shrink-0" />
                  </button>

                  {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 z-30 w-[min(calc(100vw-3rem),18rem)] p-3 bg-slate-900 text-slate-100 text-xs rounded-sm shadow-xl space-y-1.5 animate-in fade-in">
                      <div className="font-bold text-[10px] text-amber-300 uppercase tracking-wider">
                        Signature Completeness Gate:
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Waiting on prerequisites before issuance:
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                        {certGate.missingItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Dev Test Force Generate button (Requirement 5) */}
              {!student.certificateIssued && !certGate.isReady && (
                <button
                  id="dev-force-generate-btn"
                  type="button"
                  onClick={handleForceGenerateDevTest}
                  className="text-[10px] font-mono text-rose-600 hover:text-rose-800 underline flex items-center gap-1 py-1"
                  title="Tests Requirement 5: Demonstrates defensive backend rejection when incomplete"
                >
                  <Bug size={11} className="shrink-0" />
                  <span>[Dev Test] Gate Rejection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Defensive Rejection Error Modal / Banner (Requirement 5) */}
      {defensiveError && (
        <div className="p-3.5 rounded-sm bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#B91C1C]">
            <AlertTriangle size={15} />
            <span>Defensive Signature-Completeness Gate Rejection (Simulated Backend Check)</span>
          </div>
          <p className="font-medium text-[#7F1D1D] leading-relaxed">
            {defensiveError}
          </p>
          <p className="text-[11px] text-[#991B1B] opacity-90 font-mono">
            Requires 100% Tier 1, 100% Tier 2, HOD endorsement, Student e-signature, DSW, and Registrar seal.
          </p>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3 rounded-sm border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-[#DC2626] shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 3-Tier Stepper Navigation */}
      <TierStepper
        student={student}
        activeTier={activeTierTab}
        onSelectTier={(tier) => setActiveTierTab(tier)}
      />

      {/* High-Density Overview: Dual Column (Tier 1 & Tier 2) + Tier 3 Executive Authority */}
      {activeTierTab === 0 && (
        <div className="space-y-6">
          {/* Dual Column: Tier 1 General Sections & Tier 2 Departmental Labs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Tier 1 General Sections */}
            <section className="bg-white border border-[#E5E3DD] rounded-sm flex flex-col shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E3DD] bg-slate-50 flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Tier 1 — General Sections
                </h2>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                  {tier1Cleared}/{tier1Dues.length} Cleared
                </span>
              </div>
              <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="sticky top-0 bg-white border-b border-[#E5E3DD] text-[10px] uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Section</th>
                      <th className="px-4 py-2 font-semibold">Dues</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFEC]">
                    {tier1Dues.map((d) => (
                      <tr
                        key={d.sectionCode}
                        className={d.status === 'DUE_FLAGGED' ? 'bg-amber-50/40 hover:bg-amber-50/60 transition-colors' : 'hover:bg-slate-50/70 transition-colors'}
                      >
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          <div>{d.sectionName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{d.sectionCode}</div>
                        </td>
                        <td className="px-4 py-2.5 font-mono">
                          {d.amount > 0 ? (
                            <span className="text-rose-600 font-bold">₹{d.amount.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-slate-500">₹0.00</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {d.status === 'CLEARED' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                              ✅ Cleared
                            </span>
                          ) : d.status === 'DUE_FLAGGED' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                              ⚠️ Due Flagged
                            </span>
                          ) : d.status === 'PAYMENT_SUBMITTED' ? (
                            <span className="inline-flex items-center gap-1 text-indigo-600 font-medium text-[11px]">
                              ⏳ Verification Pending
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveTierTab(1)}
                            className="text-[11px] font-semibold text-[#0F5C55] hover:underline"
                          >
                            Manage →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Tier 2 Departmental Labs */}
            <section className="bg-white border border-[#E5E3DD] rounded-sm flex flex-col shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E3DD] bg-[#33396B]/5 flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[#33396B]">
                  Tier 2 — Departmental Labs ({student.branch})
                </h2>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  {tier2Cleared}/{tier2Dues.length} Cleared
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[360px] grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E3DD]">
                {tier2Dues.map((due) => {
                  const isCleared = due.status === 'CLEARED';
                  const isFlagged = due.status === 'DUE_FLAGGED';
                  return (
                    <div
                      key={due.sectionCode}
                      onClick={() => setActiveTierTab(2)}
                      className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${
                        isFlagged ? 'bg-rose-50 hover:bg-rose-100/70' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="text-[11px] leading-tight font-medium text-slate-800">
                          {due.sectionName}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">{due.sectionCode}</div>
                      </div>
                      <div className="shrink-0">
                        {isCleared ? (
                          <span className="text-emerald-500 font-bold text-sm">✔</span>
                        ) : isFlagged ? (
                          <span className="text-rose-600 text-[10px] font-bold font-mono bg-rose-100/80 px-1.5 py-0.5 rounded">
                            ₹{due.amount}
                          </span>
                        ) : due.status === 'PAYMENT_SUBMITTED' ? (
                          <span className="text-indigo-600 text-[10px] font-mono">UTR Sent</span>
                        ) : (
                          <span className="text-slate-300 text-xs">🔒</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Section 3: Tier 3 Executive Authority Signatures */}
          <section className="bg-[#5C2A1E]/5 border border-[#5C2A1E]/20 rounded-sm p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5C2A1E] flex items-center justify-center text-white text-xs shrink-0">
                  🏛️
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-[#5C2A1E]">
                    Tier 3 — Executive Authority Signatures
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Strict sequential verification: HOD ({student.branch}) → Dean of Students Welfare → Registrar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTierTab(3)}
                className="text-xs font-semibold text-[#5C2A1E] hover:underline self-start sm:self-auto"
              >
                Signatures & Declaration Details →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stage 01: HOD */}
              <div className={`border rounded-sm p-3.5 flex flex-col justify-between ${
                student.executiveApprovals.hod.signed
                  ? 'bg-white border-emerald-300'
                  : 'bg-white/70 border-[#5C2A1E]/10'
              }`}>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Stage 01</div>
                  <div className="text-xs sm:text-sm font-bold text-[#5C2A1E]">Head of Department</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {student.executiveApprovals.hod.signed
                      ? `Signed by ${student.executiveApprovals.hod.officerName}`
                      : allLabsCleared
                      ? 'Ready for HOD digital seal'
                      : `Awaiting 100% completion of Tier 2 labs (${tier2Dues.length - tier2Cleared} remaining).`}
                  </p>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${student.executiveApprovals.hod.signed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {student.executiveApprovals.hod.signed
                      ? `SIG_${student.executiveApprovals.hod.signatureHash?.slice(0, 10)}...`
                      : 'NO_SIG_CHAIN'}
                  </span>
                </div>
              </div>

              {/* Stage 02: DSW */}
              <div className={`border rounded-sm p-3.5 flex flex-col justify-between ${
                student.executiveApprovals.dsw.signed
                  ? 'bg-white border-emerald-300'
                  : !student.executiveApprovals.hod.signed
                  ? 'bg-white/50 border-[#5C2A1E]/10 opacity-60 grayscale'
                  : 'bg-white/70 border-[#5C2A1E]/10'
              }`}>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Stage 02</div>
                  <div className="text-xs sm:text-sm font-bold text-[#5C2A1E]">Dean of Student Welfare</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {student.executiveApprovals.dsw.signed
                      ? `Signed by ${student.executiveApprovals.dsw.officerName}`
                      : !student.executiveApprovals.hod.signed
                      ? 'Locked until HOD clearance is secured.'
                      : allTier1Cleared
                      ? 'Ready for DSW institutional endorsement'
                      : 'Waiting for all Tier 1 clearances.'}
                  </p>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${student.executiveApprovals.dsw.signed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {student.executiveApprovals.dsw.signed
                      ? `SIG_${student.executiveApprovals.dsw.signatureHash?.slice(0, 10)}...`
                      : 'GATE_LOCKED_DEP'}
                  </span>
                </div>
              </div>

              {/* Stage 03: Registrar */}
              <div className={`border rounded-sm p-3.5 flex flex-col justify-between ${
                student.executiveApprovals.registrar.signed
                  ? 'bg-white border-emerald-300'
                  : !student.executiveApprovals.dsw.signed
                  ? 'bg-white/50 border-[#5C2A1E]/10 opacity-60 grayscale'
                  : 'bg-white/70 border-[#5C2A1E]/10'
              }`}>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Stage 03</div>
                  <div className="text-xs sm:text-sm font-bold text-[#5C2A1E]">Registrar / Director</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {student.executiveApprovals.registrar.signed
                      ? `Affixed by ${student.executiveApprovals.registrar.officerName}`
                      : !student.executiveApprovals.dsw.signed
                      ? 'Locked until DSW sign-off is completed.'
                      : 'Pending final university institutional seal'}
                  </p>
                </div>
                <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${student.executiveApprovals.registrar.signed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {student.executiveApprovals.registrar.signed
                      ? `SIG_${student.executiveApprovals.registrar.signatureHash?.slice(0, 10)}...`
                      : 'PENDING_REGISTRAR'}
                  </span>
                </div>
              </div>

              {/* Digital Certificate Gate Card */}
              <div className="bg-[#5C2A1E] text-white rounded-sm p-4 flex flex-col justify-between items-center text-center gap-3 border-4 border-[#5C2A1E]/20 shadow-xs">
                <div>
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-lg mx-auto mb-1 bg-white/10">
                    📜
                  </div>
                  <div className="text-xs font-bold uppercase tracking-tight">Digital Certificate Gate</div>
                  <p className="text-[10px] text-rose-100/70 mt-1 leading-snug">
                    Final verification triggers cryptographic SHA-256 Merkle root generation.
                  </p>
                </div>

                {student.certificateIssued ? (
                  <button
                    id="tier3-view-cert-cta"
                    type="button"
                    onClick={onViewCertificate}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-sm text-xs font-bold transition-colors shadow-xs cursor-pointer relative z-10"
                  >
                    View Issued Certificate
                  </button>
                ) : certGate.isReady ? (
                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    disabled={generatingCert}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-sm text-xs font-bold transition-colors shadow-xs"
                  >
                    {generatingCert ? 'Generating Hash...' : 'Generate Certificate'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTierTab(4)}
                    className="w-full py-2 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-sm text-[11px] font-semibold transition-colors"
                  >
                    🔒 View Gate Requisites
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tier 1 Desk Clearance List */}
      {activeTierTab === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Tier 1: General University Offices (7 Common Sections)
              </h2>
              <p className="text-xs text-[#615E56]">
                Central administration, residential welfare, sports, accounts, and examination clearance.
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-[#E5E3DD] text-[#37352F]">
              Cleared: <span className="font-mono-code font-bold text-[#0F5C55]">{tier1Cleared}</span> / {tier1Dues.length}
            </div>
          </div>

          <div className="space-y-2.5">
            {tier1Dues.map((due) => (
              <DueEntryRow
                key={due.sectionCode}
                due={due}
                isStaffView={false}
                onSubmitPayment={handlePaymentSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tier 2 Branch Labs & Academics */}
      {activeTierTab === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Tier 2: {student.branch} Laboratories & Academics
              </h2>
              <p className="text-xs text-[#615E56]">
                Dynamically loaded from RGUKT curriculum: Foundational, Core E2–E4 Labs, and Project Vivas.
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-[#E5E3DD] text-[#37352F]">
              Cleared: <span className="font-mono-code font-bold text-[#0F5C55]">{tier2Cleared}</span> / {tier2Dues.length}
            </div>
          </div>

          <div className="space-y-2.5">
            {tier2Dues.map((due) => (
              <DueEntryRow
                key={due.sectionCode}
                due={due}
                isStaffView={false}
                onSubmitPayment={handlePaymentSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tier 3 Executive Approvals */}
      {activeTierTab === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] font-official-serif">
              Tier 3: Executive Endorsement Chain
            </h2>
            <p className="text-xs text-[#615E56]">
              Strict sequential hierarchy: Head of Department (HOD) → Dean of Students Welfare (DSW) → Registrar.
            </p>
          </div>

          {/* Student Acknowledgement Gate */}
          <div className="bg-white border border-[#E5E3DD] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-[#0F5C55] shrink-0" />
                <h3 className="font-bold text-sm text-[#1A1A1A]">
                  Student Digital Clearance Acknowledgement
                </h3>
              </div>

              {student.studentAcknowledged ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] self-start sm:self-auto">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Acknowledged & e-Signed</span>
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] font-semibold self-start sm:self-auto">
                  Pending Student Signature
                </span>
              )}
            </div>

            <p className="text-xs text-[#52504A] leading-relaxed">
              "I, {student.name} (Roll No: {student.rollNo}), hereby declare that I have returned all library books,
              laboratory instruments, sports apparatus, and vacated hostel accommodation without encumbrances."
            </p>

            {student.studentAcknowledged ? (
              <p className="text-[11px] font-mono text-[#047857]">
                Digitally signed on: {new Date(student.studentAcknowledgedAt!).toLocaleString('en-IN')}
              </p>
            ) : (
              <button
                id="student-acknowledge-btn"
                type="button"
                onClick={handleStudentAcknowledge}
                disabled={!allTier1Cleared || !allLabsCleared}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-xs transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
              >
                {!allTier1Cleared || !allLabsCleared
                  ? 'Locked: Requires 100% Tier 1 & Tier 2 clearance first'
                  : 'Digitally Sign Declaration & Submit to HOD'}
              </button>
            )}
          </div>

          {/* Executive Sign-Off Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* HOD */}
            <div className={`p-4 rounded-xl border ${student.executiveApprovals.hod.signed ? 'bg-[#F8FAF8] border-[#C5E1D4]' : 'bg-white border-[#E5E3DD]'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C2A1E] mb-1">
                Authority 01
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Head of Department (HOD)</h4>
              <p className="text-xs text-[#615E56] mt-0.5">
                Jurisdiction: {student.branch} Department
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EFEB]">
                {student.executiveApprovals.hod.signed ? (
                  <div className="text-xs space-y-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#065F46]">
                      <CheckCircle2 size={13} />
                      <span>Endorsed</span>
                    </span>
                    <p className="text-[11px] text-[#4B5563]">
                      {student.executiveApprovals.hod.officerName}
                    </p>
                    <p className="text-[10px] font-mono-code text-[#6B7280]">
                      Hash: {student.executiveApprovals.hod.signatureHash?.slice(0, 12)}...
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-[#878274] flex items-center gap-1">
                    <Lock size={12} />
                    {allLabsCleared ? 'Pending HOD review & sign' : 'Locked (Requires 100% branch labs)'}
                  </span>
                )}
              </div>
            </div>

            {/* DSW */}
            <div className={`p-4 rounded-xl border ${student.executiveApprovals.dsw.signed ? 'bg-[#F8FAF8] border-[#C5E1D4]' : 'bg-white border-[#E5E3DD]'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C2A1E] mb-1">
                Authority 02
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Dean of Students Welfare</h4>
              <p className="text-xs text-[#615E56] mt-0.5">
                Hostels, Messes & Campus Conduct
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EFEB]">
                {student.executiveApprovals.dsw.signed ? (
                  <div className="text-xs space-y-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#065F46]">
                      <CheckCircle2 size={13} />
                      <span>Approved</span>
                    </span>
                    <p className="text-[11px] text-[#4B5563]">
                      {student.executiveApprovals.dsw.officerName}
                    </p>
                    <p className="text-[10px] font-mono-code text-[#6B7280]">
                      Hash: {student.executiveApprovals.dsw.signatureHash?.slice(0, 12)}...
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-[#878274] flex items-center gap-1">
                    <Lock size={12} />
                    {allTier1Cleared && student.executiveApprovals.hod.signed
                      ? 'Pending DSW seal'
                      : 'Locked (Requires Tier 1 + HOD)'}
                  </span>
                )}
              </div>
            </div>

            {/* Registrar */}
            <div className={`p-4 rounded-xl border ${student.executiveApprovals.registrar.signed ? 'bg-[#F8FAF8] border-[#C5E1D4]' : 'bg-white border-[#E5E3DD]'}`}>
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C2A1E] mb-1">
                Authority 03
              </div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">Registrar / Director</h4>
              <p className="text-xs text-[#615E56] mt-0.5">
                Final University Institutional Seal
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EFEB]">
                {student.executiveApprovals.registrar.signed ? (
                  <div className="text-xs space-y-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#065F46]">
                      <CheckCircle2 size={13} />
                      <span>University Seal Affixed</span>
                    </span>
                    <p className="text-[11px] text-[#4B5563]">
                      {student.executiveApprovals.registrar.officerName}
                    </p>
                    <p className="text-[10px] font-mono-code text-[#6B7280]">
                      Hash: {student.executiveApprovals.registrar.signatureHash?.slice(0, 12)}...
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-[#878274] flex items-center gap-1">
                    <Lock size={12} />
                    {student.executiveApprovals.dsw.signed
                      ? 'Pending Registrar sign'
                      : 'Locked (Requires DSW approval)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Certificate Tab */}
      {activeTierTab === 4 && (
        <div className="bg-white border border-[#E5E3DD] rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B8860B] mx-auto flex items-center justify-center">
            <Award size={32} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#1A1A1A] font-official-serif">
              Digital No-Dues Certificate Gate
            </h3>
            <p className="text-xs sm:text-sm text-[#615E56] max-w-md mx-auto mt-1">
              Tamper-evident official certificate generated with branch curriculum breakdown,
              cryptographic signatures, and public QR verification payload.
            </p>
          </div>

          {student.certificateIssued ? (
            <div className="space-y-3">
              <div className="p-3 max-w-md mx-auto rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46]">
                <span className="font-bold">Certificate Issued: </span>
                <span className="font-mono-code">{student.certificateId}</span>
              </div>
              <button
                id="tab4-view-cert-cta"
                type="button"
                onClick={onViewCertificate}
                className="py-2.5 px-6 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] active:bg-[#093530] text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer relative z-10"
              >
                Open Certificate Document View
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 max-w-lg mx-auto rounded-xl bg-[#FAF9F5] border border-[#E5E3DD] text-left text-xs space-y-2">
                <span className="font-bold text-[#37352F] block">Prerequisites Status:</span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>1. Tier 1 General Offices Cleared (7/7):</span>
                    <span className={allTier1Cleared ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {tier1Cleared}/{tier1Dues.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Tier 2 Branch Labs Cleared:</span>
                    <span className={allLabsCleared ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {tier2Cleared}/{tier2Dues.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. HOD Branch Endorsement:</span>
                    <span className={student.executiveApprovals.hod.signed ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {student.executiveApprovals.hod.signed ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>4. Student Digital Acknowledgement:</span>
                    <span className={student.studentAcknowledged ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {student.studentAcknowledged ? 'Acknowledged' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>5. Dean of Students Welfare (DSW):</span>
                    <span className={student.executiveApprovals.dsw.signed ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {student.executiveApprovals.dsw.signed ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>6. Registrar / Director Final Sign:</span>
                    <span className={student.executiveApprovals.registrar.signed ? 'text-[#059669] font-bold' : 'text-[#DC2626]'}>
                      {student.executiveApprovals.registrar.signed ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {certGate.isReady ? (
                <button
                  type="button"
                  onClick={handleGenerateCertificate}
                  className="py-2.5 px-6 rounded-xl bg-[#B8860B] hover:bg-[#9B7109] text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  Generate & Seal Certificate Now
                </button>
              ) : (
                <p className="text-xs text-[#878274] italic">
                  Complete all pending items above to unlock certificate issuance.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
