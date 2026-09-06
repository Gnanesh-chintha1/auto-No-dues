import React, { useState, useEffect } from 'react';
import { AuthSession, StudentProfile } from '../types';
import { authenticateStudentStep1, verifyStudentOtp, checkRateLimit } from '../services/authService';
import { GraduationCap, ArrowLeft, ArrowRight, ShieldCheck, KeyRound, Lock, AlertCircle, Clock } from 'lucide-react';

interface StudentLoginProps {
  onSuccess: (session: AuthSession) => void;
  onBack: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onSuccess, onBack }) => {
  // Step 1: Roll No + Password, Step 2: 6-digit OTP
  const [step, setStep] = useState<1 | 2>(1);
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [matchedStudent, setMatchedStudent] = useState<StudentProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Periodic rate limit check countdown
  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockCountdown]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = authenticateStudentStep1(rollNo, password);
    if (!res.success) {
      const rate = checkRateLimit(rollNo.trim().toUpperCase());
      if (rate.isLocked) {
        setLockCountdown(rate.remainingSeconds);
      }
      setError(res.error || 'Authentication failed.');
      return;
    }

    setMatchedStudent(res.student!);
    setStep(2);
    setOtp('123456'); // Pre-populate mock OTP for convenience
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!matchedStudent) return;

    setLoading(true);
    setTimeout(() => {
      const res = verifyStudentOtp(matchedStudent, otp);
      setLoading(false);

      if (!res.success || !res.session) {
        setError(res.error || 'Invalid OTP code.');
        return;
      }

      onSuccess(res.session);
    }, 400);
  };

  const handlePrefill = (prefillRoll: string, prefillPass: string = 'student123') => {
    setRollNo(prefillRoll);
    setPassword(prefillPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-12">
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-8 shadow-xs">
        {/* Back button */}
        <button
          type="button"
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#615E56] hover:text-[#1A1A1A] mb-5 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft size={14} className="shrink-0" />
          <span>{step === 2 ? 'Back to Credentials' : 'Back to Portal Directory'}</span>
        </button>

        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#A3D9D2] flex items-center justify-center text-[#0F5C55] shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Student Authentication</h2>
            <p className="text-xs text-[#615E56]">
              {step === 1 ? 'Step 1 of 2: University Roll Number & Password' : 'Step 2 of 2: Two-Factor Security OTP'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {lockCountdown > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2">
            <Clock size={15} className="shrink-0 animate-spin" />
            <span>Rate limit lockout active: Retry in {lockCountdown}s (Enforced server-side in production)</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                University Roll Number (Identity Key)
              </label>
              <div className="relative">
                <input
                  id="student-roll-input"
                  type="text"
                  required
                  disabled={lockCountdown > 0}
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. R200142"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] font-mono text-sm uppercase bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5C55] disabled:opacity-50 min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-[#78756E] mt-1">
                Format: R + Year Batch + 4 Digits (e.g. R200142, R200188)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                Portal Password
              </label>
              <div className="relative">
                <input
                  id="student-password-input"
                  type="password"
                  required
                  disabled={lockCountdown > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5D2C7] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5C55] disabled:opacity-50 min-h-[44px]"
                />
              </div>
            </div>

            <button
              id="student-step1-submit-btn"
              type="submit"
              disabled={lockCountdown > 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs min-h-[44px] cursor-pointer"
            >
              <span>Validate Credentials</span>
              <ArrowRight size={15} className="shrink-0" />
            </button>

            {/* Quick Demo Fillers */}
            <div className="pt-4 border-t border-[#F0EFEB]">
              <span className="text-[11px] font-semibold text-[#615E56] block mb-2">
                Quick Fill Demo Accounts:
              </span>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handlePrefill('R200142')}
                  className="p-2.5 text-left rounded-lg bg-[#F7F6F2] hover:bg-[#EBE8DE] border border-[#DDD9CE] font-mono transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="font-semibold block text-[#1A1A1A]">R200142</span>
                  <span className="text-[10px] text-[#615E56]">Alex (CSE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrefill('R200188')}
                  className="p-2.5 text-left rounded-lg bg-[#F7F6F2] hover:bg-[#EBE8DE] border border-[#DDD9CE] font-mono transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="font-semibold block text-[#1A1A1A]">R200188</span>
                  <span className="text-[10px] text-[#615E56]">Pooja (Ready Cert)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrefill('R210050')}
                  className="p-2.5 text-left rounded-lg bg-[#F7F6F2] hover:bg-[#EBE8DE] border border-[#DDD9CE] font-mono transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="font-semibold block text-[#1A1A1A]">R210050</span>
                  <span className="text-[10px] text-[#615E56]">Kiran (PUC Wing)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrefill('R200999')}
                  className="p-2.5 text-left rounded-lg bg-[#F7F6F2] hover:bg-[#EBE8DE] border border-[#DDD9CE] font-mono transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="font-semibold block text-[#1A1A1A]">R200999</span>
                  <span className="text-[10px] text-[#615E56]">Tarun (EEE Fresh)</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Step 2: 6-digit OTP */
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#F0F7F6] border border-[#A3D9D2] text-xs text-[#0F5C55]">
              <p className="font-semibold">Security Passcode Dispatched</p>
              <p className="mt-0.5 text-[11px] text-[#136A62]">
                A simulated 6-digit verification OTP was sent to Registered Mobile / Email for {matchedStudent?.name} ({matchedStudent?.rollNo}).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37352F] mb-1 uppercase tracking-wide">
                6-Digit Security OTP
              </label>
              <input
                id="student-otp-input"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] px-3.5 py-3 rounded-lg border border-[#D5D2C7] font-mono text-lg font-bold bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5C55] min-h-[48px]"
              />
              <p className="text-[11px] text-[#78756E] mt-1 text-center">
                (Mock accepts any 6 digits, e.g. 123456)
              </p>
            </div>

            <button
              id="student-verify-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              <ShieldCheck size={16} className="shrink-0" />
              <span>{loading ? 'Verifying...' : 'Authenticate & Enter Portal'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
