import React, { useState, useEffect } from 'react';
import { AuthSession, BranchCode, StaffAccount } from '../types';
import { authenticateExecutive, checkRateLimit } from '../services/authService';
import { Award, ArrowLeft, ArrowRight, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface ExecutiveLoginProps {
  onSuccess: (session: AuthSession, officer: StaffAccount) => void;
  onBack: () => void;
}

export const ExecutiveLogin: React.FC<ExecutiveLoginProps> = ({ onSuccess, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<'HOD' | 'DSW' | 'REGISTRAR'>('HOD');
  const [selectedBranch, setSelectedBranch] = useState<BranchCode>('CSE');

  const [officerId, setOfficerId] = useState('EXEC-HOD-CSE');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockCountdown]);

  const handleRoleChange = (role: 'HOD' | 'DSW' | 'REGISTRAR') => {
    setSelectedRole(role);
    setError('');
    if (role === 'HOD') {
      setOfficerId(selectedBranch === 'CSE' ? 'EXEC-HOD-CSE' : selectedBranch === 'ECE' ? 'EXEC-HOD-ECE' : 'EXEC-HOD-EEE');
    } else if (role === 'DSW') {
      setOfficerId('EXEC-DSW-01');
    } else if (role === 'REGISTRAR') {
      setOfficerId('EXEC-REG-01');
    }
  };

  const handleBranchChange = (branch: BranchCode) => {
    setSelectedBranch(branch);
    setError('');
    if (selectedRole === 'HOD') {
      if (branch === 'CSE') setOfficerId('EXEC-HOD-CSE');
      else if (branch === 'ECE') setOfficerId('EXEC-HOD-ECE');
      else if (branch === 'EEE') setOfficerId('EXEC-HOD-EEE');
    }
  };

  const handleOneClickExec = (
    role: 'HOD' | 'DSW' | 'REGISTRAR',
    branch: BranchCode = 'CSE',
    customId?: string
  ) => {
    setSelectedRole(role);
    if (role === 'HOD') setSelectedBranch(branch);

    let id = customId;
    if (!id) {
      if (role === 'HOD') id = `EXEC-HOD-${branch}`;
      else if (role === 'DSW') id = 'EXEC-DSW-01';
      else id = 'EXEC-REG-01';
    }

    setOfficerId(id);
    setPassword('demo123');
    setError('');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = authenticateExecutive({
        officerId: id!,
        password: 'demo123',
        selectedRole: role,
        selectedBranch: role === 'HOD' ? branch : undefined,
      });

      if (!res.success || !res.session || !res.staffAccount) {
        setError(res.error || 'Executive clearance gate rejected credentials.');
        return;
      }

      onSuccess(res.session, res.staffAccount);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = authenticateExecutive({
        officerId,
        password,
        selectedRole,
        selectedBranch: selectedRole === 'HOD' ? selectedBranch : undefined,
      });

      if (!res.success || !res.session || !res.staffAccount) {
        const rate = checkRateLimit(officerId.trim().toUpperCase());
        if (rate.isLocked) {
          setLockCountdown(rate.remainingSeconds);
        }
        setError(res.error || 'Executive clearance gate rejected credentials.');
        return;
      }

      onSuccess(res.session, res.staffAccount);
    }, 350);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#615E56] hover:text-[#1A1A1A] mb-5 transition-colors cursor-pointer py-1"
      >
        <ArrowLeft size={14} className="shrink-0" />
        <span>Back to Portal Directory</span>
      </button>

      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FDF2F0] border border-[#F8C8C0] flex items-center justify-center text-[#5C2A1E] shrink-0">
            <Award size={22} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] font-official-serif">
              Executive Approvals
            </h2>
            <p className="text-xs text-[#615E56]">
              Tier 3 Institutional Sign-Off Authority Desk
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-[#DC2626]" />
            <div>
              <p className="font-bold">Executive Authority Rejection</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {lockCountdown > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
            <Clock size={16} className="shrink-0 animate-spin" />
            <span>Executive terminal locked: Retry in {lockCountdown}s</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Executive Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#37352F] mb-1.5 uppercase tracking-wide">
              Select Executive Office:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('HOD')}
                className={`py-2.5 px-2 text-center rounded-lg border text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  selectedRole === 'HOD'
                    ? 'bg-[#5C2A1E] text-white border-[#5C2A1E]'
                    : 'bg-[#FAF9F5] border-[#DDD9CE] text-[#44413B] hover:bg-[#F2EFE6]'
                }`}
              >
                HOD
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DSW')}
                className={`py-2.5 px-2 text-center rounded-lg border text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  selectedRole === 'DSW'
                    ? 'bg-[#5C2A1E] text-white border-[#5C2A1E]'
                    : 'bg-[#FAF9F5] border-[#DDD9CE] text-[#44413B] hover:bg-[#F2EFE6]'
                }`}
              >
                DSW
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('REGISTRAR')}
                className={`py-2.5 px-2 text-center rounded-lg border text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  selectedRole === 'REGISTRAR'
                    ? 'bg-[#5C2A1E] text-white border-[#5C2A1E]'
                    : 'bg-[#FAF9F5] border-[#DDD9CE] text-[#44413B] hover:bg-[#F2EFE6]'
                }`}
              >
                Registrar
              </button>
            </div>
          </div>

          {/* If HOD, select branch */}
          {selectedRole === 'HOD' && (
            <div>
              <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                Branch Jurisdiction:
              </label>
              <select
                id="exec-branch-select"
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value as BranchCode)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white font-medium focus:ring-2 focus:ring-[#5C2A1E] min-h-[44px]"
              >
                <option value="CSE">CSE — Computer Science & Engineering</option>
                <option value="ECE">ECE — Electronics & Communication Engg.</option>
                <option value="EEE">EEE — Electrical & Electronics Engg.</option>
                <option value="MECH">MECH — Mechanical Engineering</option>
                <option value="CIVIL">CIVIL — Civil Engineering</option>
                <option value="CHEM">CHEM — Chemical Engineering</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
              Executive Officer ID
            </label>
            <input
              id="exec-officer-id-input"
              type="text"
              required
              disabled={lockCountdown > 0}
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value.toUpperCase())}
              placeholder="e.g. EXEC-HOD-CSE"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] font-mono text-sm uppercase bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5C2A1E] disabled:opacity-50 min-h-[44px]"
            />
          </div>

          {/* Demo Passcode Notice Banner */}
          <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E3DD] flex items-center justify-between text-xs">
            <span className="text-[#615E56] font-medium">
              Demo Passcode: <span className="font-mono font-bold text-[#1A1A1A]">demo123</span> (or any passcode)
            </span>
            <span className="text-[11px] font-semibold text-[#5C2A1E] bg-[#FDF2F0] px-2 py-0.5 rounded-full border border-[#F8C8C0]">
              1-Click Login
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
              Executive Authority Passcode
            </label>
            <input
              id="exec-password-input"
              type="password"
              required
              disabled={lockCountdown > 0}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (e.g. demo123)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5C2A1E] disabled:opacity-50 min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <button
              id="exec-login-submit-btn"
              type="submit"
              disabled={loading || lockCountdown > 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5C2A1E] hover:bg-[#461F16] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
            >
              <span>{loading ? 'Verifying Executive Mandate...' : 'Enter Executive Sign-Off Desk'}</span>
              <ArrowRight size={15} className="shrink-0" />
            </button>

            <button
              id="quick-bypass-exec-btn"
              type="button"
              onClick={() => handleOneClickExec('HOD', 'CSE', 'EXEC-HOD-CSE')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <span>⚡ Quick Bypass / Demo Access as HOD (Prof. Ch. Radhika)</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-[#F0EFEB] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#37352F]">
              Quick Demo Officers (Click to Log In Immediately):
            </span>
            <span className="text-[10px] text-[#615E56]">1-Click Access</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleOneClickExec('HOD', 'CSE', 'EXEC-HOD-CSE')}
              className="p-2.5 text-left rounded-xl bg-[#FDF2F0] hover:bg-[#FAE5E1] border border-[#F8C8C0] transition-all min-h-[44px] cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#5C2A1E] block">
                  ✓ HOD CSE: EXEC-HOD-CSE
                </span>
                <span className="text-[11px] text-[#37352F]">Prof. Ch. Radhika (Head of Department)</span>
              </div>
              <span className="text-[10px] font-semibold text-[#5C2A1E] group-hover:translate-x-0.5 transition-transform">
                Enter ➔
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOneClickExec('DSW', undefined, 'EXEC-DSW-01')}
              className="p-2.5 text-left rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] transition-all min-h-[44px] cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#33396B] block">
                  ✓ DSW: EXEC-DSW-01
                </span>
                <span className="text-[11px] text-[#37352F]">Prof. K. Ravindra (Dean Student Welfare)</span>
              </div>
              <span className="text-[10px] font-semibold text-[#33396B] group-hover:translate-x-0.5 transition-transform">
                Enter ➔
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOneClickExec('REGISTRAR', undefined, 'EXEC-REG-01')}
              className="p-2.5 text-left rounded-xl bg-[#FAF9F5] hover:bg-[#F2EFE6] border border-[#DDD9CE] transition-all min-h-[44px] cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-[#1A1A1A] block">
                  ✓ Registrar: EXEC-REG-01
                </span>
                <span className="text-[11px] text-[#37352F]">Prof. G. Ravi (Registrar, RGUKT RK Valley)</span>
              </div>
              <span className="text-[10px] font-semibold text-[#1A1A1A] group-hover:translate-x-0.5 transition-transform">
                Enter ➔
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0EFEB] text-[11px] text-[#615E56] leading-relaxed">
          <span className="font-semibold text-[#3D3A34] block mb-1">
            Institutional Hierarchy Mandate:
          </span>
          Strict sequence enforced by university statutes: HOD cannot sign until 100% branch labs are cleared; DSW and Registrar cannot sign until Tier 1 + HOD endorsement are complete.
        </div>
      </div>
    </div>
  );
};
