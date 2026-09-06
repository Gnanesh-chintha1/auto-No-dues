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
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5C2A1E] disabled:opacity-50 min-h-[44px]"
            />
          </div>

          <button
            id="exec-login-submit-btn"
            type="submit"
            disabled={loading || lockCountdown > 0}
            className="w-full py-2.5 px-4 rounded-xl bg-[#5C2A1E] hover:bg-[#461F16] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
          >
            <span>{loading ? 'Verifying Executive Mandate...' : 'Enter Executive Sign-Off Desk'}</span>
            <ArrowRight size={15} className="shrink-0" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F0EFEB] text-[11px] text-[#615E56] leading-relaxed">
          <span className="font-semibold text-[#3D3A34] block mb-1">
            Institutional Hierarchy Mandate:
          </span>
          Strict sequence enforced by university statutes: HOD cannot sign until 100% branch labs are cleared; DSW and Registrar cannot sign until Tier 1 + HOD endorsement are complete.
        </div>
      </div>
    </div>
  );
};
