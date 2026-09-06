import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { StudentProfile, DueRecord } from '../types';
import { BarChart3, CheckCircle2, Clock, ArrowRight, ShieldCheck, Check, Layers } from 'lucide-react';

interface ClearanceRoadmapChartProps {
  student: StudentProfile;
  onSelectTier: (tier: 1 | 2 | 3) => void;
}

export const ClearanceRoadmapChart: React.FC<ClearanceRoadmapChartProps> = ({
  student,
  onSelectTier,
}) => {
  const [viewMode, setViewMode] = useState<'percentage' | 'count'>('percentage');

  // Extract dues and calculate tier progression
  const allDues = Object.values(student.dues || {}) as DueRecord[];
  const tier1Dues = allDues.filter((d) => d.tier === 1);
  const tier2Dues = allDues.filter((d) => d.tier === 2);

  const tier1Cleared = tier1Dues.filter((d) => d.status === 'CLEARED').length;
  const tier2Cleared = tier2Dues.filter((d) => d.status === 'CLEARED').length;

  const tier1Total = tier1Dues.length || 1;
  const tier2Total = tier2Dues.length || 1;

  const tier1Percent = Math.min(100, Math.round((tier1Cleared / tier1Total) * 100));
  const tier2Percent = Math.min(100, Math.round((tier2Cleared / tier2Total) * 100));

  // Tier 3: 4 Executive Steps (HOD, Student Acknowledgement, DSW, Registrar)
  const tier3Steps = [
    { label: 'HOD', signed: Boolean(student.executiveApprovals?.hod?.signed) },
    { label: 'Student E-Sign', signed: Boolean(student.studentAcknowledged) },
    { label: 'DSW', signed: Boolean(student.executiveApprovals?.dsw?.signed) },
    { label: 'Registrar', signed: Boolean(student.executiveApprovals?.registrar?.signed) },
  ];
  const tier3Cleared = tier3Steps.filter((s) => s.signed).length;
  const tier3Percent = Math.round((tier3Cleared / 4) * 100);

  const chartData = [
    {
      tierId: 'tier1',
      tierIndex: 1 as const,
      shortLabel: 'Tier 1: General',
      fullLabel: 'Tier 1 — General Sections',
      cleared: tier1Cleared,
      pending: tier1Dues.length - tier1Cleared,
      total: tier1Dues.length,
      percentage: tier1Percent,
      color: '#0F5C55', // Deep University Teal
      secondaryColor: '#E2E8F0',
      scope: 'Central Library, Hostels, Sports, Accounts, TPO, Exam Cell, Mentor',
      currentStatus:
        tier1Percent === 100
          ? '100% Cleared & Cryptographically Sealed'
          : `${tier1Dues.length - tier1Cleared} of ${tier1Dues.length} Sections Pending`,
    },
    {
      tierId: 'tier2',
      tierIndex: 2 as const,
      shortLabel: `Tier 2: Labs (${student.branch})`,
      fullLabel: `Tier 2 — Academic Labs (${student.branch})`,
      cleared: tier2Cleared,
      pending: tier2Dues.length - tier2Cleared,
      total: tier2Dues.length,
      percentage: tier2Percent,
      color: '#33396B', // Deep Academic Indigo
      secondaryColor: '#E2E8F0',
      scope: `${student.branch} Departmental Coursework & Practical Labs`,
      currentStatus:
        tier2Percent === 100
          ? '100% Departmental Labs Cleared'
          : `${tier2Dues.length - tier2Cleared} of ${tier2Dues.length} Labs Pending Clearance`,
    },
    {
      tierId: 'tier3',
      tierIndex: 3 as const,
      shortLabel: 'Tier 3: Executive',
      fullLabel: 'Tier 3 — Executive Authority Sign-offs',
      cleared: tier3Cleared,
      pending: 4 - tier3Cleared,
      total: 4,
      percentage: tier3Percent,
      color: '#8C3B2B', // Executive Seal Rust
      secondaryColor: '#E2E8F0',
      scope: 'HOD Endorsement, Student Declaration, DSW Approval, Registrar Seal',
      currentStatus:
        tier3Percent === 100
          ? 'All 4 Executive Approvals Completed'
          : `${tier3Cleared} of 4 Seals Acquired`,
    },
  ];

  // Overall combined readiness
  const totalSteps = tier1Dues.length + tier2Dues.length + 4;
  const totalClearedSteps = tier1Cleared + tier2Cleared + tier3Cleared;
  const overallRoadmapProgress = Math.round((totalClearedSteps / (totalSteps || 1)) * 100);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1C1B19] text-white p-3 rounded-sm shadow-xl border border-stone-700 text-xs min-w-[240px] space-y-2">
          <div className="flex items-center justify-between border-b border-stone-700 pb-1.5">
            <span className="font-bold text-stone-100">{data.fullLabel}</span>
            <span
              className="font-mono font-bold px-1.5 py-0.5 rounded text-[10px]"
              style={{ backgroundColor: `${data.color}33`, color: data.color === '#0F5C55' ? '#34D399' : data.color === '#33396B' ? '#93C5FD' : '#FDA4AF' }}
            >
              {data.percentage}%
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-snug">{data.scope}</p>
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Cleared / Completed:</span>
              <span className="font-mono font-bold text-emerald-400">
                {data.cleared} of {data.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Pending Review:</span>
              <span className="font-mono font-semibold text-amber-300">{data.pending}</span>
            </div>
          </div>
          <div className="text-[10px] text-stone-400 italic pt-1.5 border-t border-stone-800 flex items-center gap-1 text-emerald-300">
            <span>Click bar to inspect tier details</span>
            <ArrowRight size={10} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-sm border border-[#E5E3DD] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EFEC]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0F5C55]/10 flex items-center justify-center text-[#0F5C55]">
              <BarChart3 size={15} />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1A1A] tracking-tight">
              3-Tier Clearance Completion Roadmap
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {overallRoadmapProgress}% Total Progress
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual trajectory across institutional administration, departmental laboratories, and executive sign-offs.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center self-start sm:self-auto gap-1 bg-[#F5F4F0] p-0.5 rounded-sm border border-[#E5E3DD] text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('percentage')}
            className={`px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'percentage'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completion %
          </button>
          <button
            type="button"
            onClick={() => setViewMode('count')}
            className={`px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'count'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Item Counts
          </button>
        </div>
      </div>

      {/* Main Recharts Bar Chart Area */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'percentage' ? (
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -12, bottom: 8 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload[0]) {
                  const targetTier = state.activePayload[0].payload?.tierIndex;
                  if (targetTier) onSelectTier(targetTier);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E3DD' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E3DD' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F7F4' }} />
              <Bar
                dataKey="percentage"
                name="Completion Rate (%)"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -12, bottom: 8 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload[0]) {
                  const targetTier = state.activePayload[0].payload?.tierIndex;
                  if (targetTier) onSelectTier(targetTier);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEA" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E3DD' }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E3DD' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F7F4' }} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
              />
              <Bar
                dataKey="cleared"
                name="Cleared / Signed"
                stackId="tierStack"
                fill="#0F5C55"
                radius={[0, 0, 0, 0]}
                cursor="pointer"
              />
              <Bar
                dataKey="pending"
                name="Pending Review / Action"
                stackId="tierStack"
                fill="#CBD5E1"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Milestone Cards Below Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#F0EFEC]">
        {chartData.map((tier) => {
          const isComplete = tier.percentage === 100;
          return (
            <div
              key={tier.tierId}
              onClick={() => onSelectTier(tier.tierIndex)}
              className={`p-3 rounded-sm border transition-all cursor-pointer hover:shadow-xs group ${
                isComplete
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tier.color }}
                  />
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0F5C55] transition-colors">
                    {tier.fullLabel}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 shrink-0">
                  {tier.percentage}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-2">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${tier.percentage}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>

              {/* Status and Action Link */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>
                  {tier.cleared} of {tier.total} {tier.tierIndex === 3 ? 'approved' : 'cleared'}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F5C55] group-hover:underline">
                  <span>Manage</span>
                  <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
