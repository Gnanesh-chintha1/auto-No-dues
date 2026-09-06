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
  Sparkles,
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

  const handleOneClickLogin = (id: string, branch?: BranchCode) => {
    setStaffId(id);
    setPassword('demo123');
    if (branch) setSelectedBranch(branch);
    setError('');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = authenticateAdmin({
        staffId: id,
        password: 'demo123',
        selectedDomain: selectedDomainId,
        selectedBranch: activeDomainTile?.isLab ? (branch || selectedBranch) : undefined,
      });

      if (!res.success || !res.session || !res.staffAccount) {
        setError(res.error || 'Login rejected by authority gate.');
        return;
      }

      onSuccess(res.session, res.staffAccount);
    }, 250);
  };

  const getPrimaryStaffForDomain = () => {
    switch (activeDomainTile?.id) {
      case 'LIBRARY':
        return {
          id: 'STF-LIB-01',
          name: 'Dr. K. Srinivasulu',
          designation: 'Chief University Librarian',
          email: 'library@rgukt.ac.in',
          altId: 'library@rgukt.ac.in',
        };
      case 'HOSTEL_BOYS':
        return {
          id: 'STF-WRD-01',
          name: 'Prof. M. Venkat Rao',
          designation: 'Chief Warden (Boys Hostels & Messes)',
          email: 'warden@rgukt.ac.in',
          altId: 'STF-HST-01',
        };
      case 'HOSTEL_GIRLS':
        return {
          id: 'STF-HST-02',
          name: 'Dr. B. Lakshmi Devi',
          designation: 'Chief Warden (Girls Hostels & Messes)',
          email: 'warden.girls@rgukt.ac.in',
          altId: 'warden.girls@rgukt.ac.in',
        };
      case 'ACCOUNTS':
        return {
          id: 'STF-ACC-01',
          name: 'Sri V. Ramana Murthy',
          designation: 'Senior Accounts Superintendent',
          email: 'accounts@rgukt.ac.in',
          altId: 'STF-ACT-01',
        };
      case 'SPORTS':
        return {
          id: 'STF-SPT-01',
          name: 'Dr. N. Chandrasekhar',
          designation: 'Physical Education Director',
          email: 'sports@rgukt.ac.in',
          altId: 'sports@rgukt.ac.in',
        };
      case 'LAB_INCHARGE':
        return {
          id: 'STF-LAB-CSE-01',
          name: 'Sri K. Praveen Kumar',
          designation: 'CSE Lab Technical Officer',
          email: 'praveen.cse@rguktrkv.ac.in',
          branch: 'CSE' as BranchCode,
          altId: 'STF-LAB-ECE-01',
        };
      case 'TPO':
        return {
          id: 'STF-TPO-01',
          name: 'Sri P. Sumanth',
          designation: 'Training & Placement Officer',
          email: 'tpo@rgukt.ac.in',
          altId: 'tpo@rguktrkv.ac.in',
        };
      case 'EXAM_CELL':
        return {
          id: 'STF-EXM-01',
          name: 'Dr. T. Hemalatha',
          designation: 'Additional Controller of Examinations',
          email: 'coe@rgukt.ac.in',
          altId: 'coe@rguktrkv.ac.in',
        };
      case 'FACULTY_ADVISOR':
        return {
          id: 'STF-ADV-01',
          name: 'Dr. G. Rajesh Kumar',
          designation: 'Senior Associate Professor & Mentor',
          email: 'advisor@rgukt.ac.in',
          altId: 'advisor@rguktrkv.ac.in',
        };
      default:
        return {
          id: 'STF-LIB-01',
          name: 'Authorized Desk Officer',
          designation: 'Department Authority',
          email: 'admin@rgukt.ac.in',
          altId: 'STF-LIB-01',
        };
    }
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

            {/* Demo Passcode Notice Banner */}
            <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E3DD] flex items-center justify-between text-xs">
              <span className="text-[#615E56] font-medium">
                Demo Passcode: <span className="font-mono font-bold text-[#1A1A1A]">demo123</span> (or any passcode)
              </span>
              <span className="text-[11px] font-semibold text-[#33396B] bg-[#EEF2FF] px-2 py-0.5 rounded-full border border-[#C7D2FE]">
                Auto-Login Enabled
              </span>
            </div>

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
                  placeholder="•••••••• (e.g. demo123)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#33396B] disabled:opacity-50 min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={loading || lockCountdown > 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#33396B] hover:bg-[#282D54] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
                >
                  <span>{loading ? 'Verifying Authorization...' : `Access ${activeDomainTile.name}`}</span>
                  <ArrowRight size={15} className="shrink-0" />
                </button>

                {/* Prominent Quick Bypass Button */}
                {(() => {
                  const p = getPrimaryStaffForDomain();
                  return (
                    <button
                      id="quick-bypass-admin-btn"
                      type="button"
                      disabled={loading || lockCountdown > 0}
                      onClick={() => handleOneClickLogin(p.id, p.branch)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs min-h-[44px] cursor-pointer"
                    >
                      <Sparkles size={16} className="shrink-0" />
                      <span>⚡ Quick Bypass / Demo Access ({p.name})</span>
                    </button>
                  );
                })()}
              </div>
            </form>

            {/* Quick Demo Credentials Cards (Click to auto-fill & login immediately) */}
            <div className="pt-4 border-t border-[#F0EFEB] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#37352F]">
                  Quick Demo Credentials (Click to Log In Immediately):
                </span>
                <span className="text-[10px] text-[#615E56]">1-Click Access</span>
              </div>

              {(() => {
                const primary = getPrimaryStaffForDomain();
                const mismatchId = activeDomainTile.id === 'SPORTS' ? 'STF-LIB-01' : 'STF-SPT-01';
                const mismatchLabel =
                  activeDomainTile.id === 'SPORTS'
                    ? 'Librarian (STF-LIB-01)'
                    : 'Sports Officer (STF-SPT-01)';

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Primary valid account */}
                      <button
                        type="button"
                        onClick={() => handleOneClickLogin(primary.id, primary.branch)}
                        className="p-3 text-left rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#1E2554] transition-all min-h-[50px] cursor-pointer shadow-2xs group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#33396B] flex items-center gap-1">
                              <span>✓ Valid:</span>
                              <span className="font-mono">{primary.id}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-[#33396B] group-hover:translate-x-0.5 transition-transform">
                              Enter ➔
                            </span>
                          </div>
                          <span className="font-medium block text-[11px] text-[#1A1A1A] mt-0.5">
                            {primary.name}
                          </span>
                          <span className="text-[10px] text-[#615E56] block">
                            {primary.designation}
                          </span>
                        </div>
                      </button>

                      {/* Secondary valid alias or email */}
                      {primary.altId && primary.altId !== primary.id && (
                        <button
                          type="button"
                          onClick={() => handleOneClickLogin(primary.altId, primary.branch)}
                          className="p-3 text-left rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#14532D] transition-all min-h-[50px] cursor-pointer shadow-2xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#15803D] flex items-center gap-1">
                                <span>✓ Alt:</span>
                                <span className="font-mono">{primary.altId}</span>
                              </span>
                              <span className="text-[10px] font-semibold text-[#15803D] group-hover:translate-x-0.5 transition-transform">
                                Enter ➔
                              </span>
                            </div>
                            <span className="font-medium block text-[11px] text-[#1A1A1A] mt-0.5">
                              {primary.email}
                            </span>
                            <span className="text-[10px] text-[#615E56] block">
                              Registered University Alias
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Distinct Optional Error-Testing Panel */}
                    <div className="mt-3 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#92400E] mb-1">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Optional Security Testing (Domain Scope Defense):</span>
                      </div>
                      <p className="text-[11px] text-[#78350F] mb-2 leading-relaxed">
                        Test that unauthorized accounts outside this department are properly rejected by the authority gate.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStaffId(mismatchId);
                          setPassword('demo123');
                          setError('');
                          setLoading(true);
                          setTimeout(() => {
                            setLoading(false);
                            const res = authenticateAdmin({
                              staffId: mismatchId,
                              password: 'demo123',
                              selectedDomain: selectedDomainId,
                            });
                            if (!res.success) {
                              setError(res.error || 'Domain Authorization Error: Cross-domain access denied.');
                            }
                          }, 250);
                        }}
                        className="w-full py-2 px-3 text-left rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[11px] font-semibold flex items-center justify-between transition-colors min-h-[38px] cursor-pointer"
                      >
                        <span>✗ Test Cross-Domain Rejection: Try login as {mismatchLabel}</span>
                        <ArrowRight size={13} className="shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
