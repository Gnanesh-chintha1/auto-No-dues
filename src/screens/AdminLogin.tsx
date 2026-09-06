import React, { useState, useEffect } from 'react';
import { AuthSession, BranchCode, StaffAccount, Tier1DomainId } from '../types';
import { authenticateAdmin, checkRateLimit } from '../services/authService';
import {
  Building2,
  BookOpen,
  Home,
  Trophy,
  Landmark,
  Briefcase,
  GraduationCap,
  FlaskConical,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (session: AuthSession, staff: StaffAccount) => void;
  onBack: () => void;
}

interface DomainTile {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isLab?: boolean;
  hasSubChoice?: boolean;
}

const DOMAIN_TILES: DomainTile[] = [
  {
    id: 'LIBRARY',
    name: 'Central Library System',
    description: 'Catalog audit, RFID fine reconciliations, book return logs',
    icon: BookOpen,
  },
  {
    id: 'HOSTEL_BOYS',
    name: "Boys' Hostel & Mess Committee",
    description: 'Mess dues ledger, room furniture inspection, keys return',
    icon: Home,
  },
  {
    id: 'HOSTEL_GIRLS',
    name: "Girls' Hostel & Mess Committee",
    description: 'Girls hostel mess dues, inventory inspection, room sign-off',
    icon: Home,
  },
  {
    id: 'SPORTS',
    name: 'Sports & Physical Education',
    description: 'Gymnasium gear, sports kit, tournament gear returns',
    icon: Trophy,
  },
  {
    id: 'ACCOUNTS',
    name: 'University Accounts / Fee Section',
    description: 'Tuition fees, scholarship audits, caution deposit ledger',
    icon: Landmark,
  },
  {
    id: 'LAB_INCHARGE',
    name: 'Academic Labs & Workshops',
    description: 'Branch-specific laboratories, viva evaluations, breakage dues',
    icon: FlaskConical,
    isLab: true,
  },
  {
    id: 'TPO',
    name: 'Training & Placement Cell',
    description: 'Corporate interview bonds, offer compliance, placement logs',
    icon: Briefcase,
  },
  {
    id: 'EXAM_CELL',
    name: 'Examination Section (CoE)',
    description: 'Grade ledger verification, exam fees, certificate audit',
    icon: GraduationCap,
  },
  {
    id: 'FACULTY_ADVISOR',
    name: 'Class / Faculty Advisor',
    description: 'Academic mentorship sign-off, minimum attendance audit',
    icon: Users,
  },
];

const AVAILABLE_BRANCHES: { code: BranchCode; name: string }[] = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'CSE-AI&ML', name: 'CSE (Artificial Intelligence & ML)' },
  { code: 'ECE', name: 'Electronics & Communication Engg.' },
  { code: 'EEE', name: 'Electrical & Electronics Engg.' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
  { code: 'CHEM', name: 'Chemical Engineering' },
  { code: 'PUC-WING', name: 'Pre-University Course (PUC) Wing' },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  // Step 1: Domain Selection (and sub-branch if lab)
  // Step 2: Domain-specific credentials entry
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<BranchCode>('CSE');

  // Credentials
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockCountdown]);

  const activeDomainTile = DOMAIN_TILES.find((d) => d.id === selectedDomainId);

  const handleSelectDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    setError('');
    // Transition to Step 2
    setCurrentStep(2);
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Calls authenticateAdmin which enforces strict server-side domain checking
      const res = authenticateAdmin({
        staffId,
        password,
        selectedDomain: selectedDomainId,
        selectedBranch: activeDomainTile?.isLab ? selectedBranch : undefined,
      });

      if (!res.success || !res.session || !res.staffAccount) {
        const rate = checkRateLimit(staffId.trim().toUpperCase());
        if (rate.isLocked) {
          setLockCountdown(rate.remainingSeconds);
        }
        setError(res.error || 'Login rejected by authority gate.');
        return;
      }

      onSuccess(res.session, res.staffAccount);
    }, 350);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
      {/* Back button */}
      <button
        type="button"
        onClick={currentStep === 2 ? () => setCurrentStep(1) : onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#615E56] hover:text-[#1A1A1A] mb-5 transition-colors cursor-pointer py-1"
      >
        <ArrowLeft size={14} className="shrink-0" />
        <span>{currentStep === 2 ? 'Back to Domain Directory' : 'Back to Portal Directory'}</span>
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-8 shadow-xs">
        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-[#E5E3DD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#33396B] shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
                {currentStep === 1 ? 'Admin Domain Selection' : `${activeDomainTile?.name} Clearance Desk`}
              </h2>
              <p className="text-xs text-[#615E56]">
                {currentStep === 1
                  ? 'Step 1 of 2: Select your assigned university administrative desk'
                  : 'Step 2 of 2: Authenticate with domain-scoped staff credentials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                currentStep === 1 ? 'bg-[#33396B] text-white' : 'bg-[#E5E3DD] text-[#615E56]'
              }`}
            >
              1. Choose Domain
            </span>
            <span className="text-[#C5BFB0] font-mono">→</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                currentStep === 2 ? 'bg-[#33396B] text-white' : 'bg-[#F0EFEB] text-[#949086]'
              }`}
            >
              2. Domain Login
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2.5">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-[#DC2626]" />
            <div>
              <p className="font-bold">Security Domain Authorization Failed</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
              <p className="text-[11px] text-[#7F1D1D] mt-1 italic">
                (Simulating server-side middleware domain authorization check)
              </p>
            </div>
          </div>
        )}

        {lockCountdown > 0 && (
          <div className="mb-6 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
            <Clock size={16} className="shrink-0 animate-spin" />
            <span>Rate limit lockout active: Retry in {lockCountdown}s</span>
          </div>
        )}

        {/* STEP 1: Domain Picker Grid */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {DOMAIN_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    id={`domain-tile-${tile.id}`}
                    type="button"
                    onClick={() => handleSelectDomain(tile.id)}
                    className="text-left p-4 rounded-xl border border-[#E5E3DD] hover:border-[#33396B] hover:bg-[#F9FAFF] transition-all group flex flex-col justify-between cursor-pointer min-h-[140px]"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#33396B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#33396B] transition-colors">
                        {tile.name}
                      </h3>
                      <p className="text-xs text-[#615E56] mt-1 leading-relaxed">
                        {tile.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#33396B] pt-2 border-t border-[#F0EFEB]">
                      <span>Open Desk Login</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Domain-Specific Login Form */}
        {currentStep === 2 && activeDomainTile && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-start gap-3">
              <activeDomainTile.icon size={22} className="text-[#33396B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#33396B]">
                  Domain Scope Locked:
                </span>
                <p className="font-bold text-sm text-[#1E2554]">{activeDomainTile.name}</p>
                <p className="text-xs text-[#4E5691] mt-0.5">
                  Only staff accounts officially enrolled under {activeDomainTile.id} can authenticate.
                </p>
              </div>
            </div>

            {/* If lab, choose branch */}
            {activeDomainTile.isLab && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#37352F] uppercase tracking-wide">
                  Academic Department / Branch:
                </label>
                <select
                  id="admin-branch-select"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as BranchCode)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white font-medium focus:ring-2 focus:ring-[#33396B] min-h-[44px]"
                >
                  {AVAILABLE_BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                  Staff Identification ID / Email
                </label>
                <input
                  id="staff-id-input"
                  type="text"
                  required
                  disabled={lockCountdown > 0}
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. STF-LIB-01"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] font-mono text-sm uppercase bg-white focus:outline-hidden focus:ring-2 focus:ring-[#33396B] disabled:opacity-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                  Staff Passcode
                </label>
                <input
                  id="staff-password-input"
                  type="password"
                  required
                  disabled={lockCountdown > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#33396B] disabled:opacity-50 min-h-[44px]"
                />
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={loading || lockCountdown > 0}
                className="w-full py-2.5 px-4 rounded-xl bg-[#33396B] hover:bg-[#282D54] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
              >
                <span>{loading ? 'Verifying Authorization...' : `Access ${activeDomainTile.name}`}</span>
                <ArrowRight size={15} className="shrink-0" />
              </button>
            </form>

            {/* Quick Demo Pre-fill helpers */}
            <div className="pt-4 border-t border-[#F0EFEB] text-xs space-y-2">
              <span className="font-semibold text-[#615E56] block">
                Quick Demo Credentials (Test Matching vs Domain Mismatch):
              </span>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-[11px]">
                {activeDomainTile.id === 'LIBRARY' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId('STF-LIB-01');
                      setPassword('admin123');
                    }}
                    className="p-2.5 text-left rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#33396B] min-h-[44px] cursor-pointer"
                  >
                    <span className="font-bold block">✓ Valid: STF-LIB-01</span>
                    <span>Dr. Srinivasulu (Chief Librarian)</span>
                  </button>
                )}

                {activeDomainTile.id === 'HOSTEL_BOYS' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId('STF-HST-01');
                      setPassword('admin123');
                    }}
                    className="p-2.5 text-left rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#33396B] min-h-[44px] cursor-pointer"
                  >
                    <span className="font-bold block">✓ Valid: STF-HST-01</span>
                    <span>Prof. Venkat Rao (Boys Hostel)</span>
                  </button>
                )}

                {activeDomainTile.id === 'ACCOUNTS' && (
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId('STF-ACT-01');
                      setPassword('admin123');
                    }}
                    className="p-2.5 text-left rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#33396B] min-h-[44px] cursor-pointer"
                  >
                    <span className="font-bold block">✓ Valid: STF-ACT-01</span>
                    <span>Sri Ramana Murthy (Accounts)</span>
                  </button>
                )}

                {activeDomainTile.isLab && (
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId('STF-LAB-CSE-01');
                      setSelectedBranch('CSE');
                      setPassword('admin123');
                    }}
                    className="p-2.5 text-left rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#33396B] min-h-[44px] cursor-pointer"
                  >
                    <span className="font-bold block">✓ Valid: STF-LAB-CSE-01</span>
                    <span>Sri Praveen Kumar (CSE Labs)</span>
                  </button>
                )}

                {/* Deliberate Mismatch button to demonstrate Step 3 security rule */}
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('STF-SPT-01'); // Sports officer trying to log into another desk
                    setPassword('admin123');
                  }}
                  className="p-2.5 text-left rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] min-h-[44px] cursor-pointer"
                >
                  <span className="font-bold block">✗ Test Unauthorized: STF-SPT-01</span>
                  <span>(Sports officer testing rejection in this domain)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
