import React from 'react';
import { CheckCircle2, Lock, AlertCircle, ShieldAlert, LayoutGrid } from 'lucide-react';
import { DueRecord, StudentProfile } from '../types';

interface TierStepperProps {
  student: StudentProfile;
  activeTier?: 0 | 1 | 2 | 3 | 4;
  onSelectTier?: (tier: 0 | 1 | 2 | 3 | 4) => void;
}

export const TierStepper: React.FC<TierStepperProps> = ({
  student,
  activeTier = 0,
  onSelectTier,
}) => {
  const allDues = Object.values(student.dues) as DueRecord[];
  const tier1Items = allDues.filter((d) => d.tier === 1);
  const tier2Items = allDues.filter((d) => d.tier === 2);

  const tier1Cleared = tier1Items.filter((d) => d.status === 'CLEARED').length;
  const tier1Total = tier1Items.length;
  const tier1Complete = tier1Cleared === tier1Total && tier1Total > 0;

  const tier2Cleared = tier2Items.filter((d) => d.status === 'CLEARED').length;
  const tier2Total = tier2Items.length;
  const tier2Complete = tier2Cleared === tier2Total && tier2Total > 0;

  const exec = student.executiveApprovals;
  const execApprovedCount = (exec.hod.signed ? 1 : 0) + (exec.dsw.signed ? 1 : 0) + (exec.registrar.signed ? 1 : 0);
  const execComplete = execApprovedCount === 3;

  const steps = [
    {
      tierNumber: 0 as const,
      name: 'High-Density Overview',
      subtitle: 'All Tiers & Signatures',
      isComplete: tier1Complete && tier2Complete && execComplete,
      isLocked: false,
      icon: <LayoutGrid size={13} />,
    },
    {
      tierNumber: 1 as const,
      name: 'Tier 1: General Offices',
      subtitle: `${tier1Cleared}/${tier1Total} Cleared`,
      isComplete: tier1Complete,
      isLocked: false,
      flaggedCount: tier1Items.filter((d) => d.status === 'DUE_FLAGGED').length,
    },
    {
      tierNumber: 2 as const,
      name: `Tier 2: ${student.branch} Labs`,
      subtitle: `${tier2Cleared}/${tier2Total} Cleared`,
      isComplete: tier2Complete,
      isLocked: false,
      flaggedCount: tier2Items.filter((d) => d.status === 'DUE_FLAGGED').length,
    },
    {
      tierNumber: 3 as const,
      name: 'Tier 3: Executive Chain',
      subtitle: `HOD • DSW • Registrar (${execApprovedCount}/3)`,
      isComplete: execComplete,
      isLocked: !tier2Complete,
      lockReason: !tier2Complete ? 'Requires 100% Tier-2 Labs Clearance' : undefined,
    },
    {
      tierNumber: 4 as const,
      name: 'Certificate Gate',
      subtitle: student.certificateIssued ? 'Issued & Verified' : 'Cryptographic Mint',
      isComplete: student.certificateIssued,
      isLocked: !(tier1Complete && tier2Complete && execComplete && student.studentAcknowledged),
      lockReason: 'Requires 100% clearance, 3 executive seals, and student acknowledgement',
    },
  ];

  return (
    <div id="tier-stepper-container" className="w-full bg-white border border-[#E5E3DD] rounded-sm p-2.5 sm:p-3 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {steps.map((step) => {
          const isActive = activeTier === step.tierNumber;

          return (
            <button
              key={step.tierNumber}
              id={`tier-step-btn-${step.tierNumber}`}
              type="button"
              onClick={() => onSelectTier?.(step.tierNumber)}
              className={`text-left p-3 rounded-sm border transition-all relative flex flex-col justify-between min-h-[54px] sm:min-h-[64px] cursor-pointer ${
                isActive
                  ? 'border-[#0F5C55] bg-[#0F5C55]/5 text-[#0F5C55] font-medium shadow-2xs ring-1 ring-[#0F5C55]/20'
                  : step.isComplete
                  ? 'border-[#A7F3D0] bg-[#FAFAF8] hover:bg-emerald-50/50'
                  : step.isLocked
                  ? 'border-[#E5E3DD] bg-[#FAFAF8] opacity-70 hover:border-[#D1CEBF]'
                  : 'border-[#E5E3DD] bg-white hover:border-[#B5B0A2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                      isActive
                        ? 'bg-[#0F5C55] text-white'
                        : step.isComplete
                        ? 'bg-[#D1FAE5] text-[#065F46]'
                        : step.isLocked
                        ? 'bg-[#F0EFEB] text-[#78756E]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {step.tierNumber === 0 ? 'VIEW' : `STAGE 0${step.tierNumber}`}
                  </span>

                  <div className="shrink-0">
                    {step.isComplete ? (
                      <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
                    ) : step.isLocked ? (
                      <Lock size={13} className="text-[#8C877C] shrink-0" />
                    ) : step.flaggedCount && step.flaggedCount > 0 ? (
                      <span className="flex items-center text-[10px] font-bold text-[#B91C1C]">
                        <AlertCircle size={12} className="mr-0.5 text-[#DC2626] shrink-0" />
                        {step.flaggedCount} due
                      </span>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>

                <div className="font-semibold text-xs text-[#1A1A1A] leading-tight truncate">
                  {step.name}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                {step.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

