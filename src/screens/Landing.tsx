import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Fingerprint,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface LandingProps {
  onSelectFlow: (flow: 'student' | 'admin' | 'executive' | 'verify') => void;
  onQuickDemo?: (rollNo: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onSelectFlow, onQuickDemo }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Institutional Hero Banner */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#DDD9CE] text-[11px] sm:text-xs font-semibold text-[#44413B] shadow-xs">
          <ShieldCheck size={14} className="text-[#0F5C55] shrink-0" />
          <span>Rajiv Gandhi University of Knowledge Technologies • RK Valley Campus</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight font-official-serif">
          Automated{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 bg-clip-text text-transparent font-extrabold">
            No-Dues
          </span>{' '}
          & Digital Clearance Portal
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#52504A] max-w-2xl mx-auto leading-relaxed">
          Three-tier institutional clearance hierarchy, staff-first due verification,
          and cryptographically signed, tamper-evident digital certificates.
        </p>
      </div>

      {/* 3 Top-Level Entry Paths (Requirement 3.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* 1. Student Login */}
        <div
          id="entry-card-student"
          className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#0F5C55]"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#A3D9D2] flex items-center justify-center text-[#0F5C55] group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap size={24} />
            </div>

            <div>
              <div className="text-xs font-bold text-[#0F5C55] uppercase tracking-wider mb-1">
                Entry Path 01
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Student Portal</h2>
              <p className="text-xs text-[#615E56] mt-1.5 leading-relaxed">
                Direct login via University Roll Number. View live 3-tier clearance status,
                settle staff-recorded dues via UTR reference, and download your verified certificate.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0EFEB] text-xs text-[#52504A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#059669] shrink-0" />
                <span>Real-time tier progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#059669] shrink-0" />
                <span>Fixed due settlement & UTR submission</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#059669] shrink-0" />
                <span>Digital e-signature acknowledgement</span>
              </div>
            </div>
          </div>

          <button
            id="student-login-cta"
            type="button"
            onClick={() => onSelectFlow('student')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer"
          >
            <span>Proceed to Student Login</span>
            <ArrowRight size={15} className="shrink-0" />
          </button>
        </div>

        {/* 2. Admin Login (Domain-First Selection) */}
        <div
          id="entry-card-admin"
          className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#33396B]"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#33396B] group-hover:scale-105 transition-transform shrink-0">
              <Building2 size={24} />
            </div>

            <div>
              <div className="text-xs font-bold text-[#33396B] uppercase tracking-wider mb-1">
                Entry Path 02
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Admin & Lab Desks</h2>
              <p className="text-xs text-[#615E56] mt-1.5 leading-relaxed">
                Domain-first selection for Tier 1 offices (Library, Hostel, Accounts, Sports)
                and Tier 2 lab in-charges. Enforces server-side domain verification.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0EFEB] text-xs text-[#52504A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#33396B] shrink-0" />
                <span>Staff-first due entry (₹0 or fee amount)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#33396B] shrink-0" />
                <span>Student payment UTR verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#33396B] shrink-0" />
                <span>Cryptographic SignStamp generation</span>
              </div>
            </div>
          </div>

          <button
            id="admin-login-cta"
            type="button"
            onClick={() => onSelectFlow('admin')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#33396B] hover:bg-[#282D54] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer"
          >
            <span>Select Admin Domain</span>
            <ArrowRight size={15} className="shrink-0" />
          </button>
        </div>

        {/* 3. Executive Approvals */}
        <div
          id="entry-card-executive"
          className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#5C2A1E] md:col-span-2 lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FDF2F0] border border-[#F8C8C0] flex items-center justify-center text-[#5C2A1E] group-hover:scale-105 transition-transform shrink-0">
              <Award size={24} />
            </div>

            <div>
              <div className="text-xs font-bold text-[#5C2A1E] uppercase tracking-wider mb-1">
                Entry Path 03
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Executive Approvals</h2>
              <p className="text-xs text-[#615E56] mt-1.5 leading-relaxed">
                Tier 3 authorities: Head of Department (HOD) → Dean of Students Welfare (DSW) → Registrar / Director.
                Enforces strict sequencing gates.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0EFEB] text-xs text-[#52504A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#5C2A1E] shrink-0" />
                <span>HOD sign-off (requires 100% labs clear)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#5C2A1E] shrink-0" />
                <span>DSW seal (requires Tier 1 + HOD sign)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#5C2A1E] shrink-0" />
                <span>Registrar final university clearance seal</span>
              </div>
            </div>
          </div>

          <button
            id="executive-login-cta"
            type="button"
            onClick={() => onSelectFlow('executive')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#5C2A1E] hover:bg-[#461F16] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer"
          >
            <span>Executive Authority Login</span>
            <ArrowRight size={15} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* System Architecture Highlights (Institutional Trust) */}
      <div className="bg-[#FAF9F5] border border-[#E5E3DD] rounded-2xl p-5 sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
            Institutional Integrity & Compliance Standards
          </h2>
          <p className="text-xs sm:text-sm text-[#615E56] mt-1">
            Built strictly around RGUKT RK Valley's administrative protocols and branch curricula.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Fingerprint size={16} className="text-[#0F5C55] shrink-0" />
              <span>Roll Number Identity Key</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Roll Number is the sole identity key everywhere. Dues, signatures, and certificates
              are cryptographically anchored to official student IDs without ambiguous name collisions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Lock size={16} className="text-[#33396B] shrink-0" />
              <span>Staff-First Due Entry</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Students cannot declare dues. Every section remains greyed as "Pending review" until
              authorized staff records ₹0 or a fixed due. Students can only submit payment UTRs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2 sm:col-span-2 lg:col-span-1">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <FileCheck2 size={16} className="text-[#5C2A1E] shrink-0" />
              <span>Cryptographic Hash Chains</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Every officer sign-off produces a deterministic SHA-256 SignStamp. The master certificate
              aggregates all stamps into an immutable Merkle root, verifiable publicly via QR code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
